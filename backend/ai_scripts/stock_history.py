import yfinance as yf
import pandas as pd
import sys
from sqlalchemy import create_engine


#mysql+pymysql://使用者:密碼@主機/資料庫
engine = create_engine("mysql+pymysql://root:ab5563817@localhost/stock_ai_db")

def import_full_history(symbol):
    print(f"正在從yfinance抓取{symbol}的歷史資料")
    df = yf.download(symbol,period="max",auto_adjust=False)

    if df.empty:
        print("查無資料")
        return
    #整理格式符合SQL欄位
    df.reset_index(inplace=True)
    df.columns = df.columns.get_level_values(0)
    df.columns = [x.lower().replace(" ","_") for x in df.columns]
    df['symbol'] = symbol

    df.to_sql('stock_all_history',engine,if_exists='replace',index=False,chunksize=1000)
    print(f"{symbol}資料已傳入資料庫")

import_full_history(sys.argv[1] if len(sys.argv) > 1 else "2330.TW")