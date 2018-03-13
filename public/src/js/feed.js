var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');

function openCreatePostModal() {
    createPostArea.style.display = 'block';
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
    createPostArea.style.display = 'none';
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
    cardTitle.style.height = '180px';
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


