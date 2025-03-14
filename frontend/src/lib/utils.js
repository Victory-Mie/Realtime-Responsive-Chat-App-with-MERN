function formatMessageTime(date) {
  const messageDate = new Date(date);
  const today = new Date();
  
  // 判断是否是今天的消息
  if (
    messageDate.getFullYear() === today.getFullYear() &&
    messageDate.getMonth() === today.getMonth() &&
    messageDate.getDate() === today.getDate()
  ) {
    // 今天的消息显示时间 HH:MM
    return messageDate.toLocaleTimeString("cn-ZH", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } else {
    // 非今天的消息显示完整日期 YYYY年MM月DD日
    return messageDate.toLocaleDateString("cn-ZH", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  }
}

export { formatMessageTime };
