var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');
var form = document.querySelector('form');
var titleInput = document.querySelector('#title');
var locationInput = document.querySelector('#location');
var videoPlayer = document.querySelector('#player');
var canvasElement = document.querySelector('#canvas');
var captureButton = document.querySelector('#capture-btn');
var imagePicker = document.querySelector('#image-picker');
var imagePickerArea = document.querySelector('#pick-image');
var picture;

function initializeMedia() {
    if (!'mediaDevices' in navigator) {
        navigator.mediaDevices = {};
    }

    if (!('getUserMedia' in navigator.mediaDevices)) {
        navigator.mediaDevices.getUserMedia = function(constrains) {
            var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

            if (!getUserMedia) {
                return Promise.reject(new Error('getUserMedia is not implemented...'));
            }

            return new Promise(function(resolve, reject) {
                getUserMedia.call(navigator, constrains, resolve, reject);
            });
        }
    }

    navigator.mediaDevices.getUserMedia({video: true})
        .then(function(stream) {
            videoPlayer.srcObject = stream;
            videoPlayer.style.display = 'block';
        })
        .catch(function(err) {
            imagePickerArea.style.display = 'block';
        });
}

captureButton.addEventListener('click', function(event) {
    canvasElement.style.display = 'block';
    videoPlayer.style.display = 'none';
    captureButton.style.display = 'none';
    var context = canvasElement.getContext('2d');
    context.drawImage(videoPlayer, 0, 0, canvas.width, videoPlayer.videoHeight / (videoPlayer.videoWidth / canvas.width));
    videoPlayer.srcObject.getVideoTracks().forEach(function(track) {
        track.stop();
    });
    picture = dataURItoBlob(canvasElement.toDataURL());
});

imagePicker.addEventListener('change', function(event) {
    picture = event.target.files[0];
});

function openCreatePostModal() {
    // createPostArea.style.display = 'block';
    // setTimeout(function() {
        createPostArea.style.transform = 'translateY(0)';
        initializeMedia();
    // }, 1);
    if (deferredPrompt) {
        deferredPrompt.prompt();

        deferredPrompt.userChoice.then(function (choiceResult) {
            console.log(choiceResult.outcome);

            if (choiceResult.outcome === 'dismissed') {
                console.log('User cancelled installation');
            } else {
                console.log('User added to home screen');
            }
        });

        deferredPrompt = null;
    }

    // unregister service worker
    // if ('serviceWorker' in navigator) {
    //     navigator.serviceWorker.getRegistrations()
    //         .then(function(registrations) {
    //             for (var i = 0; i < registrations.length; i++) {
    //                 registrations[i].unregister();
    //             }
    //         })
    // }
}

function closeCreatePostModal() {
    createPostArea.style.transform = 'translateY(100vh)';
    imagePickerArea.style.display = 'none';
    videoPlayer.style.display = 'none';
    canvasElement.style.display = 'none';
    // createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

// currently not in use, allows to cache assets on demand
function onSaveButtonClicked(event) {
    console.log('clicked');
    if ('caches' in window) {
        caches.open('user-requested')
            .then(function(cache) {
                cache.add('https://httpbin.org/get');
                cache.add('/src/images/sf-boat.jpg');
            });
    }
}

function clearCards() {
    while(sharedMomentsArea.hasChildNodes()) {
        sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
    }
}

function createCard(data) {
    var cardWrapper = document.createElement('div');
    cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
    var cardTitle = document.createElement('div');
    cardTitle.className = 'mdl-card__title';
    cardTitle.style.backgroundImage = 'url(' + data.image + ')';
    cardTitle.style.backgroundSize = 'cover';
    cardWrapper.appendChild(cardTitle);
    var cardTitleTextElement = document.createElement('h2');
    cardTitleTextElement.style.color = 'white';
    cardTitleTextElement.className = 'mdl-card__title-text';
    cardTitleTextElement.textContent = data.title;
    cardTitle.appendChild(cardTitleTextElement);
    var cardSupportingText = document.createElement('div');
    cardSupportingText.className = 'mdl-card__supporting-text';
    cardSupportingText.textContent = data.location;
    cardSupportingText.style.textAlign = 'center';
    // var cardSaveButton = document.createElement('button');
    // cardSaveButton.textContent = 'Save';
    // cardSaveButton.addEventListener('click', onSaveButtonClicked);
    // cardSupportingText.appendChild(cardSaveButton);
    cardWrapper.appendChild(cardSupportingText);
    componentHandler.upgradeElement(cardWrapper);
    sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data) {
    clearCards();
    for (var i = 0; i < data.length; i++) {
        createCard(data[i]);
    }
}


var url = 'https://litegram-268b1.firebaseio.com/posts.json';
var networkDataReceived = false;

fetch(url)
    .then(function (res) {
        return res.json();
    })
    .then(function (data) {
        networkDataReceived = true;
        console.log('[From Web]', data);
        // convert object to array
        var dataArray = [];
        for (var key in data) {
            dataArray.push(data[key]);
        }
        updateUI(dataArray);
    });

// Check if indexedDB is available:
if ('indexedDB' in window) {
    readAllData('posts')
        .then(function(data) {
            if(!networkDataReceived) {
                console.log('[From Cache]', data);
                updateUI(data);
            }
        });
}

// Check if cache is available:
// if ('caches' in window) {
//     caches.match(url)
//         .then(function (res) {
//             if (res) {
//                 return res.json();
//             }
//         })
//         .then(function(data) {
//             console.log('[From Cache]', data);
//             if (!networkDataReceived) {
//                 var dataArray = [];
//                 for (var key in data) {
//                     dataArray.push(data[key]);
//                 }
//                 updateUI(dataArray);
//             }
//         });
// }

function sendData() {   // Directly send data to back-end without using syncronize event
    var id = new Date().toISOString;
    var postData = new FormData();
    postData.append('id', id);
    postData.append('title', titleInput.value);
    postData.append('location', locationInput.value);
    postData.append('file', picture, id + '.png');

    fetch('https://us-central1-litegram-268b1.cloudfunctions.net/storePostData', {
        method: 'POST',
        body: postData
    })
    .then(function(res) {
        console.log('[Sent Data]', res);
        updateUI();
    })
}

form.addEventListener('submit', function(event) {
    event.preventDefault();

    if (titleInput.value.trim() === '' || locationInput.value.trim() === '') {
        alert('Please enter valid data');
        return;
    }

    closeCreatePostModal();

    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready
            .then(function(sw) {
                var post = {
                    id: new Date().toISOString(),
                    title: titleInput.value,
                    location: locationInput.value,
                    picture: picture
                };
                writeData('sync-posts', post)
                    .then(function() {
                        return sw.sync.register('sync-new-posts');
                    })
                    .then(function() {
                        var snackbarContainer = document.querySelector('#confirmation-toast');
                        var data = { message: 'Your post is saved for syncing...' };
                        snackbarContainer.MaterialSnackbar.showSnackbar(data);
                    })
                    .catch(function(err) {
                        console.log(err);
                    });
            });
    } else {
        sendData();
    }
});
