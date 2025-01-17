document.addEventListener("DOMContentLoaded", () => {
  // 获取当前时间
  const now = new Date();

  // 获取当前时间的时间戳，并转换为中国时区时间
  const chinaTime = new Date(now.getTime() + (8 * 60 * 60 * 1000)); // UTC+8 时区偏移

  // 获取中国时区时间的字符串表示 (格式：yyyy-MM-dd HH:mm:ss)
  const formattedTime = chinaTime.toISOString().replace("T", " ").slice(0, 19);

  // 获取中国时区时间的时间戳（毫秒）
  const timestamp = chinaTime.getTime();

  // 获取页面元素
  const info = document.getElementById("info");

  // 替换示例时间和时间戳，交换它们的位置并加入换行
  info.innerHTML = `
    <p>双击网页中的时间戳(毫秒或秒)会自动显示对应的格式化时间。</p>
    <p>格式示例：<br><br><strong>${timestamp}</strong></p>
    <p>双击网页中的格式化时间会自动显示对应的时间戳(毫秒)。</p>
    <p>格式示例：<br><br><strong>${formattedTime}</strong></p>
    <p>记得点击按钮复制到剪贴板哦！</p>
  `;
});