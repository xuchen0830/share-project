import React, { useRef } from 'react';

interface AddProjectButtonProps {
  onSuccess: () => void;
}

const AddProjectButton: React.FC<AddProjectButtonProps> = ({ onSuccess }) => {
  // 建立一個「勾子」來抓取隱藏的檔案選擇器
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. 先問其他文字資訊（暫時維持用 prompt，之後可以改 Modal）
    const title = prompt("請輸入專案標題：");
    if (!title) return;
    const description = prompt("請輸入專案描述：") || "";
    const skills = prompt("請輸入專案技能 (用逗號隔開)：") || "";

    // 2. 關鍵：使用 FormData 包裝檔案與文字
    const formData = new FormData();
    formData.append('image', file);       // 這邊的 'image' 要對應後端的 upload.single('image')
    formData.append('title', title);
    formData.append('description', description);
    formData.append('skills', skills);

    try {
      // 3. 發送請求，注意：傳送 FormData 時「不要」設定 Content-Type 標頭
      const response = await fetch('http://127.0.0.1:8080/api/projects', {
        method: 'POST',
        body: formData, 
      });

      if (response.ok) {
        alert("新增成功！");
        onSuccess();
      } else {
        alert("上傳失敗，請檢查後端設定");
      }
    } catch (err) {
      console.error("新增出錯:", err);
    }

    // 清除選擇的檔案，讓下次選同一個檔案也能觸發
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div>
      {/* 隱藏真正的檔案選擇器 */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*"
        onChange={handleFileChange} 
      />
      
      {/* 讓使用者點擊這個漂亮的按鈕來觸發檔案選擇 */}
      <button 
        onClick={() => fileInputRef.current?.click()} 
        style={{ 
          backgroundColor: '#1e293b', 
          color: 'white', 
          padding: '10px 20px', 
          borderRadius: '6px', 
          cursor: 'pointer',
          border: 'none',
          fontWeight: 'bold'
        }}
      >
        新增專案 (選圖片)
      </button>
    </div>
  );
};

export default AddProjectButton;