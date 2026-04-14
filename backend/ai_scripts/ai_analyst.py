import sys # 記得在最上面 import sys
import yfinance as yf
import pandas as pd
from google import genai
import os
from sqlalchemy import create_engine
from datetime import datetime
from sqlalchemy import text
import feedparser
import urllib.parse



# 連接資料庫
engine = create_engine("mysql+pymysql://root:ab5563817@localhost/stock_ai_db")

import feedparser  # 💡 如果報錯，請執行 pip install feedparser
import urllib.parse

def get_latest_news(symbol):
    try:
        # 💡 將搜尋字詞轉為 URL 編碼，避免亂碼
        query = urllib.parse.quote(f"{symbol} 股市")
        # 💡 直接抓取 Google News RSS (這比模擬網頁爬蟲穩定 100 倍)
        rss_url = f"https://news.google.com/rss/search?q={query}&hl=zh-TW&gl=TW&ceid=TW:zh-Hant"
        
        feed = feedparser.parse(rss_url)
        
        news_list = []
        # 💡 抓取
        for entry in feed.entries[:all]:
            # RSS 的格式非常固定，不會有 NoneType get 錯誤
            title = entry.title
            # 移除標題末尾的來源 (例如: - 自由時報)
            clean_title = title.split(' - ')[0]
            news_list.append(f"- {clean_title}")
            
        if news_list:
            return "\n".join(news_list)
        return "目前無重大相關新聞。"

    except Exception as e:
        # 萬一連 RSS 都掛了，回傳空字串，不影響 AI 分析
        return "暫時無法取得即時新聞。"

def update_to_latest_data(symbol):
    try:
        last_date_query = f"SELECT MAX(date) as ld FROM stock_all_history WHERE symbol = '{symbol}'"
        last_date_df = pd.read_sql(last_date_query, engine)
        last_date = last_date_df.iloc[0]['ld']

        if last_date is None:
            print(f"抱歉，資料庫中目前沒有 {symbol} 的歷史數據，正在抓取歷史資料")
            df = yf.download(symbol,period="max",auto_adjust=False)
        else:
            # 確保last_date是datetime物件
            if isinstance(last_date, str):
                last_date = datetime.strptime(last_date, '%Y-%m-%d %H:%M:%S')

            start_date =  last_date.strftime('%Y-%m-%d')
            print(f"正在檢查{symbol}從{start_date}開始的歷史資料")
            df = yf.download(symbol,start=start_date,period="max",auto_adjust=False)

                

        if not df.empty:
            df.reset_index(inplace=True)

            # 如果欄位是多層的，只取第一層（例如只取 'Close', 不取 'TSLA'
            if isinstance(df.columns, pd.MultiIndex):
                df.columns = df.columns.get_level_values(0)

            # 確保欄位名稱變成純字串，並處理空格
            df.columns = [str(x).lower().replace(" ","_") for x in df.columns]
            df['symbol'] = symbol

            with engine.begin() as conn:
                if last_date:
                    delete_date = last_date.strftime('%Y-%m-%d')
                    conn.execute(text(f"DELETE FROM stock_all_history WHERE symbol = '{symbol}' AND date ='{delete_date}'"))
                
                df.to_sql('stock_all_history',con=conn, if_exists='append',index=False)
                print(f"{symbol}最新資料已傳入資料庫")
        else:
            print(f"{symbol}資料已是最新資料無需更新")

    except Exception as e:
        print(f"發生錯誤：{e}")
       

def ai_stock_report(symbol):

    update_to_latest_data(symbol)

    news_context = get_latest_news(symbol)

    query = f"SELECT date, adj_close,volume FROM stock_all_history WHERE symbol = '{symbol}' ORDER BY date DESC"
    df = pd.read_sql(query, engine)
    # 把數據變成文字「小抄」餵給 Llama 3
    data_str = df.to_string(index=False)
    
    # 召喚 Llama 3
    gemini = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))   
    prompt = f"""
        【重要規則】：你的所有回應必須使用繁體中文，嚴禁出現任何英文句子或段落。
        你是一位精通全球宏觀經濟與台股走勢的資深分析師。
        請結合「歷史股價數據」與「最新國際政經新聞」為 Asher 進行深度診斷。

        【最新股價數據】：
        {data_str}

        【最新相關政經新聞】：
        {news_context}

        【分析任務】：
        1. 數據分析：根據數據判斷目前股價處於什麼階段？
        2. 買賣建議：考量政經情勢與量價關係，給予明確的操作建議（買進/持有/觀望）並說明風險。
        """
    
    print(f"Gemini 正在分析 {symbol} 的數據及新聞...")
    response = gemini.models.generate_content(model="gemini-2.5-flash", contents=prompt)
    return response.text

if __name__ == "__main__":
    # 取得 Node.js 傳過來的第一個參數，如果沒有則預設 2330.TW
    target_symbol = sys.argv[1] if len(sys.argv) > 1 else "2330.TW"
    report = ai_stock_report(target_symbol)
    print(report) # 只要印出 report 就好，Node.js 才能接收到