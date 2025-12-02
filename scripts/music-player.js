const playBtnElement = document.getElementById('play-pause-button');
const prevBtnElement = document.getElementById('prev-song-button');
const nextBtnElement = document.getElementById('next-song-button');

const albumCoverArt = document.getElementById("album-cover");
const songTimeBarFilled = document.getElementById('song-time-bar-filled');

const shuffleBtnElement = document.getElementById('shuffle-song-button');
const repeatBtnElement = document.getElementById('repeat-song-button');

const playlistEl = document.querySelector(".scanned-music-list");

const repeatStages = [0,1,2];
let repeatDefault = repeatStages[0];

let shuffledSongList = [];
let shuffleSongIndex = null;

const selectFolder = document.getElementById('getMusic');

const audio = new Audio();
let songLength = 0;
let songListExpanded = 0;
let intervalId = "";

async function getSongs() {
  try {
    const dirHandle = await window.showDirectoryPicker();
    playlistEl.innerHTML = "";
    
    const audioFiles = [];

    let playlistHTMLData = "";

    for await (const entry of dirHandle.values()) {
      if (entry.kind === "file" && entry.name.toLowerCase().endsWith(".mp3")) {
        audioFiles.push(entry);
      }
    }

    if (audioFiles.length === 0) {
      playlistEl.innerHTML = "<p>No MP3 files found.</p>";
      return;
    }

    audioFiles.sort();
    //shuffledSongList = audioFiles;
    shuffledSongList = structuredClone(audioFiles);

    if(shuffleBtnElement.hasAttribute('data-shuffle-state') && shuffleBtnElement.dataset.shuffleState == 1) {
      shuffleArray(shuffledSongList);
    }

    renderSongList(audioFiles);

  } catch (err) {
      console.error(err);
  }

  if(document.getElementById('scanned-music-list').innerHTML.length > 0 && selectFolder) {
    document.getElementById('getMusic').remove();

    document.getElementById('music-list-controls-div').innerHTML = '<button id="expand-music-list" class="music-list-controls"> <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <g transform="rotate(180 12 12)"> <path d="M7 10L12 15L17 10" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g> </svg> </button> <button id="close-music-list" class="music-list-controls"> <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Menu / Close_SM"> <path id="Vector" d="M16 16L12 12M12 12L8 8M12 12L16 8M12 12L8 16" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g> </g></svg> </button>';

    renderScannedListControls();
    

  }
  
}

function renderSongList(audioFiles) {
  
  audioFiles.forEach((fileHandle, index) => {
  const playlistItem = document.createElement("div");
  playlistItem.id = "music-list-item-" + index;
  playlistItem.className = "music-list-item";
  playlistItem.textContent = fileHandle.name;

  //playlistEl.innerHTML += playlistHTMLData;
  playlistEl.appendChild(playlistItem);

  document.getElementById('music-list-item-'+index).dataset.songId = index;

  document.getElementById('music-list-item-'+index).onclick = async () => {
    const songName = fileHandle.name;
    const file = await fileHandle.getFile();
    const url = URL.createObjectURL(file);
    document.getElementById('song-name-div').innerHTML = '<p id="song-name" class="song-name">'+String(songName).substring(0, songName.length - 4)+'</p>';
    playMusic(url);

    updateMusicPlayer(file);

    playBtnElement.dataset.songId = index;

    if(index > 0) {
      prevBtnElement.dataset.songId = index-1;
    } else {
      prevBtnElement.dataset.songId = audioFiles.length - 1;
    }

    if(index < audioFiles.length - 1) {
      nextBtnElement.dataset.songId = index+1;
    } else {
      nextBtnElement.dataset.songId = 0;
    }

  };

});

}

function renderScannedListControls() {

  document.getElementById('close-music-list').addEventListener('click', () => {

    document.getElementById('scanned-music-list').innerHTML = '';

    document.getElementById('expand-music-list').remove();
    document.getElementById('close-music-list').remove();

    const btn = document.createElement("button");
    btn.id = "getMusic";
    btn.className = "getMusic";
    btn.textContent = "Select Music Folder";
    document.getElementById("musicList").appendChild(btn);

    document.getElementById('getMusic').setAttribute('onclick', 'getSongs()');

    if (window.innerWidth / window.innerHeight <= 1) {
      songListExpanded = 0;
      document.getElementById('scanned-music-list').style.height = '0%';

      document.getElementById('album-cover-div').style.display = 'inline-block';
      document.getElementById('now-playing-header-section-div').style.display = 'flex';
      document.getElementById('now-playing-card').style.height = '80%';

      document.getElementById('musicList').style.justifyContent = 'space-around';
    }

  });

  document.getElementById('expand-music-list').addEventListener('click', () => {

    if(songListExpanded == 0) {

      songListExpanded = 1;
      document.getElementById('expand-music-list').innerHTML = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7 10L12 15L17 10" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>';

      document.getElementById('scanned-music-list').style.height = '80%';

      document.getElementById('album-cover-div').style.display = 'none';
      document.getElementById('now-playing-header-section-div').style.display = 'none';
      document.getElementById('now-playing-card').style.height = '30%';

      document.getElementById('musicList').style.justifyContent = 'space-around';

      document.getElementById('close-music-list').style.display = 'none';

    } else {

      songListExpanded = 0;
      document.getElementById('expand-music-list').innerHTML = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <g transform="rotate(180 12 12)"> <path d="M7 10L12 15L17 10" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g> </svg>';

      document.getElementById('scanned-music-list').style.height = '0%';

      document.getElementById('album-cover-div').style.display = 'inline-block';
      document.getElementById('now-playing-header-section-div').style.display = 'flex';
      document.getElementById('now-playing-card').style.height = '80%';

      document.getElementById('musicList').style.removeProperty('justify-content');
      document.getElementById('close-music-list').style.display = 'inline-block';

    }
  });
}

function playMusic(songName) {
  audio.pause();
  audio.src = songName;

  audio.addEventListener('loadedmetadata', function onMeta() {
    const start_minutes = Math.floor(audio.currentTime / 60).toString().padStart(2, '0');
    const start_seconds = Math.floor(audio.currentTime % 60).toString().padStart(2, '0');

    const end_minutes = Math.floor(audio.duration / 60).toString().padStart(2, '0');
    const end_seconds = Math.floor(audio.duration % 60).toString().padStart(2, '0');

    songLength = audio.duration;
    
    document.getElementById('song-start-time').innerHTML = start_minutes+':'+start_seconds;

    document.getElementById('song-end-time').innerHTML = end_minutes+':'+end_seconds;
    
    audio.removeEventListener('loadedmetadata', onMeta);
  });

  audio.play();

  playBtnElement.innerHTML = '<svg id="play-pause-pause-button-icon" class="media-control-button-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.163 3.819C5 4.139 5 4.559 5 5.4v13.2c0 .84 0 1.26.163 1.581a1.5 1.5 0 0 0 .656.655c.32.164.74.164 1.581.164h.2c.84 0 1.26 0 1.581-.163a1.5 1.5 0 0 0 .656-.656c.163-.32.163-.74.163-1.581V5.4c0-.84 0-1.26-.163-1.581a1.5 1.5 0 0 0-.656-.656C8.861 3 8.441 3 7.6 3h-.2c-.84 0-1.26 0-1.581.163a1.5 1.5 0 0 0-.656.656zm9 0C14 4.139 14 4.559 14 5.4v13.2c0 .84 0 1.26.164 1.581a1.5 1.5 0 0 0 .655.655c.32.164.74.164 1.581.164h.2c.84 0 1.26 0 1.581-.163a1.5 1.5 0 0 0 .655-.656c.164-.32.164-.74.164-1.581V5.4c0-.84 0-1.26-.163-1.581a1.5 1.5 0 0 0-.656-.656C17.861 3 17.441 3 16.6 3h-.2c-.84 0-1.26 0-1.581.163a1.5 1.5 0 0 0-.655.656z" fill="#ffffff"></path></g></svg>';

  setTimer();

}

function updateMusicPlayer(file) {

  jsmediatags.read(file, {
  onSuccess: ({ tags }) => {

    if(tags.artist){
      document.getElementById('song-artist-name').innerHTML = tags.artist;
    } else {
      document.getElementById('song-artist-name').innerHTML = "Unknown artist";
    }       

    if (tags.picture) {
      const picture = tags.picture;
      const base64String = picture.data.map(byte => String.fromCharCode(byte)).join("");

      const imageUrl = `data:${picture.format};base64,${btoa(base64String)}`;

      albumCoverArt.style.opacity = 0;

      setTimeout(() => {
        albumCoverArt.src = imageUrl;

        albumCoverArt.style.opacity = 1;
      }, 250);

    } else {

      albumCoverArt.style.opacity = 0;

      setTimeout(() => {
        albumCoverArt.src = "Images/default-cover-art.png";

        albumCoverArt.style.opacity = 1;
      }, 250);
      
    }

  },
  onError: (error) => {
    console.error("ID3 Read Error:", error);
  }
});

}

function setTimer() {
  intervalId = setInterval(() => {
      const start_minutes = Math.floor(audio.currentTime / 60).toString().padStart(2, '0');
      const start_seconds = Math.floor(audio.currentTime % 60).toString().padStart(2, '0');
      document.getElementById('song-start-time').innerHTML = start_minutes+':'+start_seconds;

      const songPlayedPercent = (audio.currentTime/songLength)*100;

      songTimeBarFilled.style.width = songPlayedPercent+'%';

      if(document.getElementById('song-start-time').innerHTML == document.getElementById('song-end-time').innerHTML) {

        playBtnElement.innerHTML = '<svg id="play-pause-button-icon" class="media-control-button-icon" fill="#ffffff" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 460.114 460.114" xml:space="preserve" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M393.538,203.629L102.557,5.543c-9.793-6.666-22.468-7.372-32.94-1.832c-10.472,5.538-17.022,16.413-17.022,28.26v396.173 c0,11.846,6.55,22.721,17.022,28.26c10.471,5.539,23.147,4.834,32.94-1.832l290.981-198.087 c8.746-5.954,13.98-15.848,13.98-26.428C407.519,219.477,402.285,209.582,393.538,203.629z"></path> </g> </g> </g></svg>';

        clearInterval(intervalId);

        if(repeatDefault == repeatStages[2]) {

          audio.play();

          playBtnElement.innerHTML = '<svg id="play-pause-pause-button-icon" class="media-control-button-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.163 3.819C5 4.139 5 4.559 5 5.4v13.2c0 .84 0 1.26.163 1.581a1.5 1.5 0 0 0 .656.655c.32.164.74.164 1.581.164h.2c.84 0 1.26 0 1.581-.163a1.5 1.5 0 0 0 .656-.656c.163-.32.163-.74.163-1.581V5.4c0-.84 0-1.26-.163-1.581a1.5 1.5 0 0 0-.656-.656C8.861 3 8.441 3 7.6 3h-.2c-.84 0-1.26 0-1.581.163a1.5 1.5 0 0 0-.656.656zm9 0C14 4.139 14 4.559 14 5.4v13.2c0 .84 0 1.26.164 1.581a1.5 1.5 0 0 0 .655.655c.32.164.74.164 1.581.164h.2c.84 0 1.26 0 1.581-.163a1.5 1.5 0 0 0 .655-.656c.164-.32.164-.74.164-1.581V5.4c0-.84 0-1.26-.163-1.581a1.5 1.5 0 0 0-.656-.656C17.861 3 17.441 3 16.6 3h-.2c-.84 0-1.26 0-1.581.163a1.5 1.5 0 0 0-.655.656z" fill="#ffffff"></path></g></svg>';

          setTimer();

        }

      }

    }, 1000);
}

function shuffleArray(array) {

  let currentIndex = array.length;

  while(currentIndex != 0) {

    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];

  }

  console.log('array shuffled!');

}

shuffleBtnElement.addEventListener('click', () => {

  if(!shuffleBtnElement.hasAttribute('data-shuffle-state')) {
    shuffleBtnElement.dataset.shuffleState = 0;
  }

  if(shuffleBtnElement.dataset.shuffleState == 0) {

    shuffleBtnElement.classList.add("button-toggled");
    shuffleBtnElement.style.backgroundColor = "white";

    shuffleBtnElement.dataset.shuffleState = 1;
    shuffleArray(shuffledSongList);

  } else if (shuffleBtnElement.dataset.shuffleState == 1) {

    shuffleBtnElement.classList.remove("button-toggled");
    shuffleBtnElement.removeAttribute("style");

    shuffleBtnElement.dataset.shuffleState = 0;
    shuffleSongIndex = null;

  }

});

prevBtnElement.addEventListener('click', async () => {

  console.log('Before -> '+shuffleSongIndex);

  if(shuffleBtnElement.dataset.shuffleState == 1) {

    if((!audio.paused && !audio.ended && audio.currentTime > 0)) {

      //if(shuffleSongIndex === null || shuffleSongIndex === undefined) || String(shuffleSongIndex) === "null"
      shuffledSongList.forEach(async (songItem, index) => {

        if(String(shuffleSongIndex) === "null") {

          if(String(songItem.name).substring(0, songItem.name.length - 4).normalize("NFKC") == document.getElementById('song-name').textContent.trim().normalize("NFKC")){
            shuffleSongIndex = index;
          }

        }

      });

      if(shuffleSongIndex > 0) {

        shuffleSongIndex--;

        shuffledSongList.forEach(async (songItem, index) => {
          
          if(index == shuffleSongIndex) {

          const file = await songItem.getFile();
          const url = URL.createObjectURL(file);
          document.getElementById('song-name-div').innerHTML = '<p id="song-name" class="song-name">'+String(songItem.name).substring(0, songItem.name.length - 4)+'</p>';
          playMusic(url);

          updateMusicPlayer(file);

        }

        });

        
      } else {

        shuffledSongList.forEach(async (songItem, index) => {

          if(index == (shuffledSongList.length - 1)) {

            const file = await songItem.getFile();
            const url = URL.createObjectURL(file);
            document.getElementById('song-name-div').innerHTML = '<p id="song-name" class="song-name">'+String(songItem.name).substring(0, songItem.name.length - 4)+'</p>';
            playMusic(url);

            updateMusicPlayer(file);

          }

        });

      }

    } else {
      
      shuffledSongList.forEach(async (songItem, index) => {

        if(index == 0) {

          const file = await songItem.getFile();
          const url = URL.createObjectURL(file);
          document.getElementById('song-name-div').innerHTML = '<p id="song-name" class="song-name">'+String(songItem.name).substring(0, songItem.name.length - 4)+'</p>';
          playMusic(url);

          updateMusicPlayer(file);

        }

      });

    }

  } else {
    document.getElementById('music-list-item-'+prevBtnElement.dataset.songId).click();
  }
  
});

playBtnElement.addEventListener('click', () => {

  if(!audio.paused && !audio.ended && audio.currentTime > 0) {

    audio.pause();

    playBtnElement.innerHTML = '<svg id="play-pause-button-icon" class="media-control-button-icon" fill="#ffffff" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 460.114 460.114" xml:space="preserve" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M393.538,203.629L102.557,5.543c-9.793-6.666-22.468-7.372-32.94-1.832c-10.472,5.538-17.022,16.413-17.022,28.26v396.173 c0,11.846,6.55,22.721,17.022,28.26c10.471,5.539,23.147,4.834,32.94-1.832l290.981-198.087 c8.746-5.954,13.98-15.848,13.98-26.428C407.519,219.477,402.285,209.582,393.538,203.629z"></path> </g> </g> </g></svg>';

    clearInterval(intervalId);

  } else {

    audio.play();

    playBtnElement.innerHTML = '<svg id="play-pause-pause-button-icon" class="media-control-button-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.163 3.819C5 4.139 5 4.559 5 5.4v13.2c0 .84 0 1.26.163 1.581a1.5 1.5 0 0 0 .656.655c.32.164.74.164 1.581.164h.2c.84 0 1.26 0 1.581-.163a1.5 1.5 0 0 0 .656-.656c.163-.32.163-.74.163-1.581V5.4c0-.84 0-1.26-.163-1.581a1.5 1.5 0 0 0-.656-.656C8.861 3 8.441 3 7.6 3h-.2c-.84 0-1.26 0-1.581.163a1.5 1.5 0 0 0-.656.656zm9 0C14 4.139 14 4.559 14 5.4v13.2c0 .84 0 1.26.164 1.581a1.5 1.5 0 0 0 .655.655c.32.164.74.164 1.581.164h.2c.84 0 1.26 0 1.581-.163a1.5 1.5 0 0 0 .655-.656c.164-.32.164-.74.164-1.581V5.4c0-.84 0-1.26-.163-1.581a1.5 1.5 0 0 0-.656-.656C17.861 3 17.441 3 16.6 3h-.2c-.84 0-1.26 0-1.581.163a1.5 1.5 0 0 0-.655.656z" fill="#ffffff"></path></g></svg>';

    setTimer();

  }

});

nextBtnElement.addEventListener('click', async () => {
  
  if(shuffleBtnElement.dataset.shuffleState == 1) {

    shuffledSongList.forEach(async (songItem, index) => {

      console.log('"'+shuffleSongIndex+'"');

      if(String(shuffleSongIndex) === "null") {

        if(String(songItem.name).substring(0, songItem.name.length - 4).normalize("NFKC") == document.getElementById('song-name').textContent.trim().normalize("NFKC")){
          shuffleSongIndex = index;
        }

      }

    });

    if(shuffleSongIndex < shuffledSongList.length - 1) {

      shuffleSongIndex++;

      shuffledSongList.forEach(async (songItem, index) => {

        if(index == shuffleSongIndex) {

          const file = await songItem.getFile();
          const url = URL.createObjectURL(file);
          document.getElementById('song-name-div').innerHTML = '<p id="song-name" class="song-name">'+String(songItem.name).substring(0, songItem.name.length - 4)+'</p>';
          playMusic(url);

          updateMusicPlayer(file);

        }

      });
      
    } else {

      shuffledSongList.forEach(async (songItem, index) => {

        if(index == 0) {

          const file = await songItem.getFile();
          const url = URL.createObjectURL(file);
          document.getElementById('song-name-div').innerHTML = '<p id="song-name" class="song-name">'+String(songItem.name).substring(0, songItem.name.length - 4)+'</p>';
          playMusic(url);

          updateMusicPlayer(file);

        }

      });

    }

  } else {

    document.getElementById('music-list-item-'+nextBtnElement.dataset.songId).click();
    
  }
    
});

repeatBtnElement.addEventListener('click', () => {

  if(repeatDefault == repeatStages[0]) { //Repeat list
    repeatDefault = repeatStages[1];
    repeatBtnElement.classList.add("button-toggled");
    repeatBtnElement.style.backgroundColor = "white";

  } else if (repeatDefault == repeatStages[1]) { //Repeat 1
    repeatDefault = repeatStages[2];
    repeatBtnElement.innerHTML = '<svg id="repeat-song-button-icon" class="media-control-button-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M17 2l4 4-4 4"></path> <path d="M3 11v-1a4 4 0 014-4h14"></path> <path d="M7 22l-4-4 4-4"></path> <path d="M21 13v1a4 4 0 01-4 4H3"></path> <path d="M11 10h1v4"></path> </g></svg>';

  } else if (repeatDefault == repeatStages[2]) { //Repeat off

    repeatDefault = repeatStages[0];
    repeatBtnElement.innerHTML = '<svg id="repeat-song-button-icon" class="media-control-button-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M17 2L21 6M21 6L17 10M21 6H7.8C6.11984 6 5.27976 6 4.63803 6.32698C4.07354 6.6146 3.6146 7.07354 3.32698 7.63803C3 8.27976 3 9.11984 3 10.8V11M3 18H16.2C17.8802 18 18.7202 18 19.362 17.673C19.9265 17.3854 20.3854 16.9265 20.673 16.362C21 15.7202 21 14.8802 21 13.2V13M3 18L7 22M3 18L7 14" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>';
    repeatBtnElement.classList.remove("button-toggled");
    repeatBtnElement.removeAttribute("style");
    
  }

});