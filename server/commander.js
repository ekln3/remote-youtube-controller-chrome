(function () {
    //for debug
    var debug_mode = true;
    if (debug_mode) console.log("commander.js is called!")

    var SOCKET_ORIGIN;
    var SOCKET_PORT;
    var SOCKET_URL = location.href;

    var socket = io(SOCKET_URL);

    var CurrentMedias = {};

    // request currentmedias the first
    window.addEventListener("load", () => {
        if (debug_mode) console.log("onload");
        request_current_medias();
    });
    // stop ios bounce and zoom 
    document.ontouchmove = event => {
        event.preventDefault();
    };
    // request current medias to background
    function request_current_medias() {
        socket.emit("post", {
            command: "request CurrentMedias",
        });
    }

    // msg from background
    socket.on("member-post", (msg) => {
        if (debug_mode) console.log("member-post", Object.assign({}, msg));
        switch (msg.command) {
            // when received currentmedias, update tab list
            case "CurrentMedias":
                CurrentMedias = msg.CurrentMedias;
                if (debug_mode) console.log("CurrentMedias", CurrentMedias);
                UpdateTabList();
                break;
            default:
        }
    });

    // update tab list
    function UpdateTabList() {
        clearTabList();
        for (tabId in CurrentMedias) {
            let metadata = CurrentMedias[tabId];
            insertTabElem(metadata);
        }
    }

    // clear tab list
    function clearTabList() {
        // refresh list
        list = document.getElementById("tab_list");
        while (list.firstChild) {
            list.removeChild(list.firstChild);
        }
    }

    // inser tab element
    function insertTabElem(metadata) {
        // get mediatab info
        let tabId = metadata.tab.id;
        let url = metadata.tab.url
        let title = metadata.tab.title
        let favIconUrl = metadata.tab.favIconUrl;
        let thumbnailURL = "";
        try {
            thumbnailURL = metadata.artwork[0].src;
        } catch (e) { if (debug_mode) console.log(e, "there is no artwork"); }
        let is_playing = metadata.is_playing;
        let is_muted = metadata.is_muted;

        // append
        let elem_proto = document.getElementById("tab_info_proto")
        let elem_ = elem_proto.cloneNode(true)
        let elem = {};
        elem.title = elem_.querySelector(".tab_title");
        elem.thumbnail = elem_.querySelector(".thumbnail img");
        elem.favIcon = elem_.querySelector(".tab_favicon img");
        elem.play = elem_.querySelector(".tab_controller .play")
        elem.play_icon = elem_.querySelector(".tab_controller .play i")
        elem.next = elem_.querySelector(".tab_controller .next")
        elem.back = elem_.querySelector(".tab_controller .back")
        elem.forward = elem_.querySelector(".tab_controller .forward")
        elem.backward = elem_.querySelector(".tab_controller .backward")
        elem.mute = elem_.querySelector(".tab_controller .volume-mute")
        elem.mute_icon = elem_.querySelector(".tab_controller .volume-mute i")
        elem.volume_up = elem_.querySelector(".tab_controller .volume-up")
        elem.volume_down = elem_.querySelector(".tab_controller .volume-down")
        elem.pip = elem_.querySelector(".tab_controller .pip")
        elem.fullscreen = elem_.querySelector(".tab_controller .fullscreen")

        //elem.thumbnail.src = thumbnailURL;
        elem.title.innerHTML = title
        elem.title.href = url

        elem.favIcon.src = favIconUrl;

        console.log("is_playing", is_playing);

        if (is_playing) {
            elem.play_icon.classList.remove("fa-play");
            elem.play_icon.classList.add("fa-pause");
        }
        else {
            elem.play_icon.classList.remove("fa-pause");
            elem.play_icon.classList.add("fa-play");
        }
        if (is_muted) {
            elem.mute_icon.style.color = "red";
        }
        else {
            elem.mute_icon.style.color = "white";
        }

        console.log(elem_)
        
        elem_.removeAttribute("id")
        elem_.setAttribute("data-tabId", tabId)
        elem_.removeAttribute("hidden")
        elem_.style.backgroundImage = "url('" + thumbnailURL + "')";
        //grad_stl = "linear-gradient(45deg, rgba(217, 175, 217, 0.7), rgba(151, 217, 225, 0.7)),url(\"" + thumbnailURL + "\");";
        //stl = elem_.getAttribute("stlye") + grad_stl;
        //console.log(stl)
        //elem_.setAttribute("style", stl);
        //elem_.setAttribute("style", "url('" + thumbnailURL + "');" + grad_stl);
        elem_.style.backgroundRepeat = "no-repeat";
        elem_.style.backgroundSize = "cover";
        
        let list = document.getElementById("tab_list");
        list.appendChild(elem_)

        elem.play.addEventListener("click", control_media(tabId, "ss"));
        elem.next.addEventListener("click", control_media(tabId, "next_video"));
        elem.back.addEventListener("click", control_media(tabId, "previous_video"));
        elem.forward.addEventListener("click", control_media(tabId, "step_forward"));
        elem.backward.addEventListener("click", control_media(tabId, "step_backward"));
        elem.volume_up.addEventListener("click", control_media(tabId, "volume_up"));
        elem.volume_down.addEventListener("click", control_media(tabId, "volume_down"));
        elem.mute.addEventListener("click", control_media(tabId, "muteunmute"));
        elem.pip.addEventListener("click", control_media(tabId, "pip"));
        elem.fullscreen.addEventListener("click", control_media(tabId, "fullscreen"));

    }

    function control_media(tabId, control, control_info = null) {
        return () => {
            socket.emit("post", {
                command: "control media",
                control: control,
                control_info: control_info,
                tabId: tabId,
            })
        };
    }


})();