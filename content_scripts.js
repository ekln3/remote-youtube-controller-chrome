(function () {
    // for debug
    var debug_mode = true;
    //if (debug_mode) console.log("contents_script.js is called!")

    var main = function () {
        var video;

        // doc and video event listener
        window.addEventListener("load", () => {
            video = get_video();
            if (!video) return;

            for (event_name of ["play", "pause", "ended"]) {
                video.addEventListener(event_name, () => {
                    send_metadata();
                });
            }

            video.addEventListener("play", () => {
                send_metadata();
            });
        });

        // msg from background
        chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
            switch (msg.command) {
                case "request metadata":
                    send_metadata();
                    break;
                case "control media":
                    control_media(msg.control, msg.control_info, judge_site());
                    break;
                default:
            }
            return true;
        });
    }();

    // send metadata to background
    function send_metadata() {
        // send metadata if exist
        if (navigator.mediaSession.metadata) {
            chrome.runtime.sendMessage({
                command: "metadata",
                metadata: {
                    album: navigator.mediaSession.metadata.album,
                    artist: navigator.mediaSession.metadata.artist,
                    artwork: navigator.mediaSession.metadata.artwork,
                    title: navigator.mediaSession.metadata.title,
                    //is_playing: navigator.mediaSession.playbackState == "playing" ? true : false,
                    is_playing: !get_video().paused,
                    is_muted: get_video().muted,
                },
            });
        }
        else {
            // if metadata is not exist, send that metadata is nothing to background
            chrome.runtime.sendMessage({
                command: "metadata",
                metadata: null,
            });
        }
    }

    function get_video() {
        switch (judge_site()) {
            case "youtube":
                return (video = document.querySelector("#player-container video"));
            default:
                return (video = document.querySelector("#player-container video"));
        }
    }

    function judge_site() {
        let site = "youtube";
        if (location.href.indexOf("https://www.youtube.com") == 0) {
            site = "youtube";
        }
        return site;
    }

    function control_media(control, control_info, site = "youtube") {
        switch (site) {
            case "youtube":
                control_media_youtube(control, control_info);
                send_metadata();
                break;
            case "":
                break;
            default:
        }
    }

    function control_media_youtube(control, control_info) {
        let v = document.querySelector("#player-container video");
        switch (control) {
            case "ss":
                if (v.paused) {
                    v.play()
                }
                else {
                    v.pause();
                }
                break;
            case "muteunmute":
                v.muted = !v.muted;
                break;
            case "volume_up":
                v.volume = Math.min(v.volume + 0.03, 1);
                break;
            case "volume_down":
                v.volume = Math.max(v.volume - 0.03, 0);
                break;
            case "step_forward":
                v.currentTime += 5;
                break;
            case "step_backward":
                v.currentTime -= 5;
                break;
            case "next_video":
                document.querySelector(".ytp-next-button").click();
                if (document.querySelector(".ytp-next-button").ariaDisabled) {
                    history.go(1);
                }
                break;
            case "previous_video":
                if (!document.querySelector(".ytp-prev-button").ariaDisabled) {
                    document.querySelector(".ytp-prev-button").click();
                }
                else if (get_video().currentTime < 3.0) {
                    history.back();
                }
                else {
                    get_video().currentTime = 0;
                }
                break;
            case "fullscreen":
                if (document.webkitIsFullScreen) {
                    v.requestFullscreen();
                    if (debug_mode) console.log("requested fullscreen");
                }
                else {
                    document.exitFullscreen();
                }
                break;
            case "miniplayer":
                document.querySelector(".ytp-miniplayer-button").click();
                break;
            case "theater":
                document.querySelector(".ytp-size-button").click();
                break;
            case "pip":
                if (document.pictureInPictureElement) {
                    document.exitPictureInPicture();
                } else {
                    if (document.pictureInPictureEnabled) {
                        v.requestPictureInPicture();
                    }
                }
                break;
            default:
                if (debug_mode) console.log("unknown media control command:", control)
        }
    }

})();