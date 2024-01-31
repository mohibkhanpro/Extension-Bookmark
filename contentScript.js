(() => {
  let youtubeLeftControls, youtubeplayer;
  let currentVideo = "";
  let currentVideoBookmarks = [];

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, value, videoId } = obj;

    if (type === "NEW") {
      currentVideo = videoId;
      newVideoLoaded();
    } else if (type === "PLAY") {
      youtubeplayer.currentTime = value;
    } else if (type === "DELETE") {
      currentVideoBookmarks = currentVideoBookmarks.filter(
        (b) => b.time != value
      );
      chrome.storage.sync.set({
        [currentVideo]: JSON.stringify(currentVideoBookmarks),
      });

      response(currentVideoBookmarks);
    }
  });

  const fetchBookmarks = async () => {
    return new Promise((resolve) => {
      chrome.storage.sync.get([currentVideo], (obj) => {
        resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
      });
    });
  };

  const newVideoLoaded = async () => {
    const bookMarkBtnExist = document.getElementsByClassName("bookmark-btn")[0];
    currentVideoBookmarks = await fetchBookmarks();
    console.log(bookMarkBtnExist);
    if (!bookMarkBtnExist) {
      const bookmarkBtn = document.createElement("button");
      bookmarkBtn.innerHTML = "Bookmark";
      bookmarkBtn.style.height = "38px";
      bookmarkBtn.style.cursor = "pointer";
      bookmarkBtn.style.background = "white";
      bookmarkBtn.style.color = "black";
      bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
      bookmarkBtn.className = "ytp-button " + "bookmark-btn";
      youtubeLeftControls =
        document.getElementsByClassName("ytp-right-controls")[0];
      youtubeLeftControls.style.display = "flex";
      youtubeLeftControls.style.alignItems = "center";

      youtubeplayer = document.getElementsByClassName("video-stream")[0];

      youtubeLeftControls.append(bookmarkBtn);
      bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
    }
  };
  const addNewBookmarkEventHandler = async () => {
    const currentTime = youtubeplayer.currentTime;
    const newBookmark = {
      time: currentTime,
      desc: "Bookmark at" + getTime(currentTime),
    };
    console.log(newBookmark);
    currentVideoBookmarks = await fetchBookmarks();
    // let array = JSON.stringify(
    //   [...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time)
    // );
    // await set([currentVideo], array);
    chrome.storage.sync.set({
      [currentVideo]: JSON.stringify(
        [...currentVideoBookmarks, newBookmark].sort((a, b) => b.time - a.time)
      ),
    });
  };

  newVideoLoaded();
})();

const getTime = (t) => {
  var date = new Date(0);
  date.setSeconds(t);

  return date.toLocaleTimeString("en-US", { hour12: false, timeZone: "UTC" });
};

// const set = async (key, value) => {
//   return new Promise((resolve, reject) => {
//     let data = {};
//     data[key] = value;
//     chrome.storage.local.set(data, function () {
//       if (chrome.runtime.lastError) {
//         reject(chrome.runtime.lastError);
//       } else {
//         resolve();
//       }
//     });
//   });
// };
