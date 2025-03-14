// IndexedDB服务，用于本地消息存储和缓存

class MessageDB {
  constructor() {
    this.dbName = "chatAppDB";
    this.dbVersion = 1;
    this.messagesStore = "messages";
    this.db = null;
    this.maxLocalMessages = 20; // 限制本地最多存储20条消息
    this.initDB();
  }

  // 初始化数据库
  async initDB() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        console.error("您的浏览器不支持IndexedDB");
        reject("浏览器不支持IndexedDB");
        return;
      }

      const request = window.indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = (event) => {
        console.error("打开数据库失败:", event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log("数据库连接成功");
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // 创建消息存储对象，使用复合索引 [senderId+receiverId, createdAt]
        if (!db.objectStoreNames.contains(this.messagesStore)) {
          const store = db.createObjectStore(this.messagesStore, {
            keyPath: "_id",
          });

          // 创建会话索引 (用于快速查找特定会话的消息)
          store.createIndex("conversationIndex", ["senderId", "receiverId"], {
            unique: false,
          });

          // 创建时间索引 (用于消息排序和分页)
          store.createIndex("createdAtIndex", "createdAt", { unique: false });

          console.log("消息存储对象创建成功");
        }
      };
    });
  }

  // 确保数据库已初始化
  async ensureDB() {
    if (this.db) return this.db;
    return this.initDB();
  }

  // 保存消息到本地数据库，并限制每个会话最多保存20条最新消息
  async saveMessages(messages) {
    try {
      await this.ensureDB();
      const tx = this.db.transaction(this.messagesStore, "readwrite");
      const store = tx.objectStore(this.messagesStore);

      // 保存消息的 Promise
      const saveMessagesPromise = new Promise((resolve, reject) => {
        // 如果是数组，批量添加消息
        if (Array.isArray(messages)) {
          if (messages.length > 0) {
            const senderId = messages[0].senderId;
            const receiverId = messages[0].receiverId;

            // 保存新消息
            const putPromises = messages.map((message) => store.put(message));
            Promise.all(putPromises)
              .then(async () => {
                // 限制本地存储数量
                await this._limitConversationMessages(senderId, receiverId);
                resolve();
              })
              .catch((err) => {
                console.error("批量保存消息失败:", err);
                reject(err);
              });
          } else {
            resolve(); // 无消息
          }
        } else {
          // 单条消息
          const request = store.put(messages);
          request.onsuccess = async () => {
            await this._limitConversationMessages(
              messages.senderId,
              messages.receiverId
            );
            resolve();
          };
          request.onerror = (err) => {
            console.error("保存单条消息失败:", err);
            reject(err);
          };
        }
      });

      // 处理事务完成和错误
      return new Promise((resolve, reject) => {
        tx.oncomplete = async () => {
          console.log("事务完成");
          await saveMessagesPromise; // 等待消息保存完成
          resolve(true);
        };
        tx.onerror = (event) => {
          console.error("事务错误:", event.target.error);
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error("保存消息失败:", error);
      return false;
    }
  }

  // 限制会话消息数量，只保留最新的maxLocalMessages条
  async _limitConversationMessages(senderId, receiverId) {
    try {
      // 获取该会话的所有消息
      const allMessages = [];
      const tx = this.db.transaction(this.messagesStore, "readwrite");
      const store = tx.objectStore(this.messagesStore);
      const index = store.index("conversationIndex");

      // 获取 senderId 发送给 receiverId 的消息
      const range1 = IDBKeyRange.only([senderId, receiverId]);
      await this._getMessagesFromRange(index, range1, allMessages);

      // 获取 receiverId 发送给 senderId 的消息
      const range2 = IDBKeyRange.only([receiverId, senderId]);
      await this._getMessagesFromRange(index, range2, allMessages);

      // 按时间排序（从新到旧）
      allMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // 如果消息数量超过限制，删除旧消息
      if (allMessages.length > this.maxLocalMessages) {
        const messagesToDelete = allMessages.slice(this.maxLocalMessages);
        for (const message of messagesToDelete) {
          store.delete(message._id);
        }
        console.log(`已限制会话消息数量为${this.maxLocalMessages}条`);
      }

      return new Promise((resolve) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve(); // 出错时也解析，避免阻塞
      });
    } catch (error) {
      console.error("限制消息数量失败:", error);
    }
  }

  // 获取特定会话的消息
  async getConversationMessages(userId1, userId2) {
    try {
      await this.ensureDB();
      const tx = this.db.transaction(this.messagesStore, "readonly");
      const store = tx.objectStore(this.messagesStore);
      const index = store.index("conversationIndex");

      // 查询两个用户之间的所有消息 (双向)
      const messages = [];

      // 获取 userId1 发送给 userId2 的消息
      const range1 = IDBKeyRange.only([userId1, userId2]);
      await this._getMessagesFromRange(index, range1, messages);

      // 获取 userId2 发送给 userId1 的消息
      const range2 = IDBKeyRange.only([userId2, userId1]);
      await this._getMessagesFromRange(index, range2, messages);

      // 按时间排序
      messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      // 由于本地存储已限制为最多20条消息，不需要分页处理，直接返回所有消息
      console.log("获取本地消息", messages);
      return messages;
    } catch (error) {
      console.error("获取会话消息失败:", error);
      return [];
    }
  }

  // 辅助方法：从指定范围获取消息
  async _getMessagesFromRange(index, range, messages) {
    return new Promise((resolve) => {
      const request = index.openCursor(range);
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          messages.push(cursor.value);
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => resolve(); // 出错时也解析，避免阻塞
    });
  }

  // 获取最新消息的时间戳
  async getLatestMessageTimestamp(userId1, userId2) {
    try {
      const messages = await this.getConversationMessages(
        userId1,
        userId2,
        1,
        1
      );
      if (messages.length > 0) {
        return new Date(messages[messages.length - 1].createdAt).getTime();
      }
      return 0;
    } catch (error) {
      console.error("获取最新消息时间戳失败:", error);
      return 0;
    }
  }

  // 获取最早消息的时间戳
  async getOldestMessageTimestamp(userId1, userId2) {
    try {
      const allMessages = [];
      await this.ensureDB();
      const tx = this.db.transaction(this.messagesStore, "readonly");
      const store = tx.objectStore(this.messagesStore);
      const index = store.index("conversationIndex");

      // 获取 userId1 发送给 userId2 的消息
      const range1 = IDBKeyRange.only([userId1, userId2]);
      await this._getMessagesFromRange(index, range1, allMessages);

      // 获取 userId2 发送给 userId1 的消息
      const range2 = IDBKeyRange.only([userId2, userId1]);
      await this._getMessagesFromRange(index, range2, allMessages);

      // 按时间排序
      allMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      if (allMessages.length > 0) {
        return new Date(allMessages[0].createdAt).getTime();
      }
      return 0;
    } catch (error) {
      console.error("获取最早消息时间戳失败:", error);
      return 0;
    }
  }

  // 清除特定会话的消息
  async clearConversation(userId1, userId2) {
    try {
      await this.ensureDB();
      const tx = this.db.transaction(this.messagesStore, "readwrite");
      const store = tx.objectStore(this.messagesStore);
      const index = store.index("conversationIndex");

      // 删除 userId1 发送给 userId2 的消息
      await this._deleteMessagesFromRange(
        index,
        store,
        IDBKeyRange.only([userId1, userId2])
      );

      // 删除 userId2 发送给 userId1 的消息
      await this._deleteMessagesFromRange(
        index,
        store,
        IDBKeyRange.only([userId2, userId1])
      );

      return true;
    } catch (error) {
      console.error("清除会话失败:", error);
      return false;
    }
  }

  // 辅助方法：从指定范围删除消息
  async _deleteMessagesFromRange(index, store, range) {
    return new Promise((resolve) => {
      const request = index.openCursor(range);
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          store.delete(cursor.value._id);
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => resolve(); // 出错时也解析，避免阻塞
    });
  }
}

// 创建单例实例
const messageDB = new MessageDB();
export default messageDB;
