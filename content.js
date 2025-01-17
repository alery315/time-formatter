let isPopupVisible = false;  // 标记弹窗是否可见，避免重复弹窗

document.addEventListener("mouseup", handleSelection);
document.addEventListener("dblclick", handleSelection);

function parseDateToTimestamp(dateString) {
  // 将日期字符串按照空格分开
  const parts = dateString.split(' ');
  const datePart = parts[0]; // 日期部分
  let timePart = parts[1] || ''; // 时间部分，可能为空

  // 去掉时间部分末尾的冒号（如果有的话）
  if (timePart.endsWith(':')) {
    timePart = timePart.slice(0, -1); // 去掉末尾的冒号
  }

  // 如果时间部分只有小时，则补充分钟和秒
  if (timePart.length === 2) {
    timePart += ':00:00'; // 只到小时，补充分钟和秒
  } else if (timePart.length === 5) {
    timePart += ':00'; // 到分钟，补充秒
  }

  // 拼接成完整的日期时间字符串
  const fullDateStr = `${datePart} ${timePart}`;

  // 返回时间戳
  return new Date(fullDateStr).getTime();
}


function handleSelection(event) {
  const selection = window.getSelection().toString().trim();
  if (!selection || isPopupVisible) return; // 如果弹窗已经显示，不再创建新的弹窗
  console.log(selection);
  const timestampRegex = /^\d{10,13}$/; // 匹配秒或毫秒级时间戳
  const datetimeRegex = /^\d{4}[-/]\d{2}[-/]\d{2}(?:\s\d{2}(?::\d{2}(?::\d{2}(?:\.\d{1,3})?)?)?)?$/; // 匹配标准日期时间
  
  let formattedTime = "";
  let isTimestamp = false;

  // 如果是时间戳
  if (timestampRegex.test(selection)) {
    isTimestamp = true;
    const timestamp = parseInt(selection, 10);
    const date = new Date(
      String(timestamp).length === 13 ? timestamp : timestamp * 1000
    );

    // 转换为中国时区
    const chinaTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);
    formattedTime = chinaTime
      .toISOString()
      .replace("T", " ")
      .split(".")[0];
  }
  // 如果是日期时间
  else if (datetimeRegex.test(selection)) {
    formattedTime = String(parseDateToTimestamp(selection));
  } else {
    return; // 不符合格式直接返回
  }

  // 使用 chrome.runtime.getURL 获取图标路径
  const iconPath = chrome.runtime.getURL("icons/icons-copy.gif");

  // 创建弹窗
  const popup = document.createElement("div");
  popup.id = "timestamp-popup";
  popup.innerHTML = `
    <div class="popup-content">
      <span class="time-output">${formattedTime}</span>
      <img id="copy-btn" src="${iconPath}" alt="复制">
    </div>
    <style>
    .popup-content {
      display: inline-flex;  /* 使 div 中的元素保持在同一行 */
      align-items: center;   /* 保证元素在垂直方向上对齐 */
    }

    .popup-content span,
    .popup-content img {
      vertical-align: middle;  /* 确保文本和图片垂直居中对齐 */
    }

    .popup-content img {
      width: 24px;  /* 设置图片的宽度 */
      height: 24px; /* 设置图片的高度 */
      cursor: pointer;
    }
    </style>
    <span id="copy-status" style="display: none;">已复制!</span>
  `;

  // 强制设置弹窗样式
  popup.style.position = "fixed";
  popup.style.left = `${event.pageX + 10}px`;
  popup.style.top = `${event.pageY + 10}px`;
  popup.style.zIndex = "99999";  // 设置较高的z-index，确保在最上层
  popup.style.backgroundColor = "rgba(255, 255, 255, 0.9)"; // 让背景带点透明
  popup.style.padding = "10px";
  popup.style.borderRadius = "8px";
  popup.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.1)"; // 弹窗阴影

  // 将弹窗插入到 body
  document.body.appendChild(popup);
  isPopupVisible = true; // 设置弹窗可见状态

  // 复制功能
  const copyBtn = document.getElementById("copy-btn");
  const copyStatus = document.getElementById("copy-status");
  copyBtn.addEventListener("click", (e) => {
    e.stopPropagation();  // 阻止事件冒泡，避免触发其他事件

    navigator.clipboard.writeText(formattedTime)
      .then(() => {
        // 更新复制状态
        copyStatus.style.display = "inline";
        setTimeout(() => copyStatus.style.display = "none", 1000);

        // 关闭弹窗
        popup.remove();
        isPopupVisible = false;  // 弹窗关闭后更新状态

        // 取消文本选择
        window.getSelection().removeAllRanges();
      })
      .catch((error) => {
        console.error('Error copying text: ', error); // 错误处理
      });
  });

  // 点击其他地方关闭弹窗
  setTimeout(() => {
    document.addEventListener("click", () => {
      popup.remove();
      isPopupVisible = false;  // 弹窗关闭后更新状态
      window.getSelection().removeAllRanges(); // 清除选择
    }, { once: true });
  }, 200); // 延迟执行，确保mouseup事件之后再执行
}
