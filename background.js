//for debug
console.log("background.js is called!")

var SOCKET_ORIGIN;
var SOCKET_PORT;
var SOCKET_URL = "http://192.168.10.5:4000";

var socket;

var socket_first_initialed = false;

function initial_socket(url) {
    if(socket_first_initialed && SOCKET_URL != url) return;
    SOCKET_URL = url;
    SOCKET_PORT = url.split(":").slice(-1)[0];
    //SOCKET_ORIGIN = url.
    socket = io(url);

    // msg from socket
    socket.on("member-post", (msg) => {
        console.log("member-post", msg);
        switch (msg.command) {
            // msg to contorl media from socket
            case "control media":
                let tabId = msg.tabId;
                chrome.tabs.sendMessage(tabId, {
                    command: "control media",
                    control: msg.control,
                    control_info: msg.control_info,
                })
                break;
            // msg to control tabs from socket
            case "control tab":
                control_tab(msg.control, msg.control_info);
                break;
            // msg to request CurrentMedias from socket
            case "request CurrentMedias":
                send_current_medias();
                break;
            default:
        }
    });

    socket_first_initialed = true;
    console.log("initialized socket on URL:", url);
}

initial_socket(SOCKET_URL);

chrome.runtime.onMessage.addListener(msg => {
    if (msg.command == "change url") {
        let newurl = msg.newurl;
        initial_socket(newurl);
    }
});

// prepare vars
var CurrentMedias = {};

// request mediaSession metadata function
function request_metadata(tabId) {
    chrome.tabs.sendMessage(tabId, {
        command: "request metadata",
    });
}

// request metadata to contents_script when tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    request_metadata(tabId);
});

// send CurrentMedias to socket
function send_current_medias() {
    socket.emit("post", {
        command: "CurrentMedias",
        CurrentMedias: CurrentMedias,
    });
}

// delete media when tab is removed
chrome.tabs.onRemoved.addListener((tabId) => {
    delete CurrentMedias[tabId];
    console.log("CurrentMedias", Object.assign({}, CurrentMedias));
    send_current_medias();
});

// msg from contents_script
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log("received", msg);
    let tabId = sender.tab.id;
    switch (msg.command) {
        // msg to know metadata from contents_script
        case "metadata":
            if (!msg.metadata) {
                delete CurrentMedias[tabId];
            }
            else {
                CurrentMedias[tabId] = msg.metadata;
                CurrentMedias[tabId].tab = sender.tab;
            }
            console.log("CurrentMedias", Object.assign({}, CurrentMedias));
            send_current_medias();
            console.log("sent CurrentMedias");
            break;
        default:
    }
    return true;
});


// controlling tabs
function control_tab(control, control_info) {
    let tabId = control_info.tabId;
    switch (control) {
        case "close":
            break;
        case "focus":
            break;
        case "move":
            break;
        default:
    }
}

