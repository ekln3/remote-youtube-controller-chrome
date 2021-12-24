var port = 4000;
var ips = {};
var ip;
var url;

pending_ports = {};

var msg_el = document.getElementById("message");

window.onload = () => { checkport(4000) };

var getip = function (http, port_) {
    msg_el.innerHTML = "getting ip on port " + String(port_) + "...";
    pending_ports[port_] = true;
    setTimeout(() => {
        if (Object.keys(pending_ports).length == 0) return;
        msg_el.innerHTML = msg_el.innerHTML.split("<br>")[0];
        msg_el.innerHTML += "<br>Ports [" + Object.keys(pending_ports) + "] may not be available. <br>Please try after checking your port and restart the server.";
    }, 3000);
    let socket = io(http + "://localhost:" + port_);
    socket.emit("getip", { command: "getip" });

    if (!Object.keys(ips).includes(port_)) {
        ips[port_] = {};
    }

    socket.on("ip", function (msg) {
        delete pending_ports[port_];
        //msg_el.innerHTML = "Success port:" + port_;
        msg_el.innerHTML = "";
        if (msg.ips.length) {
            for (ip_ of msg.ips) {
                ips[port_][ip_] = true;
            }
        }

        let ul = document.getElementById("ips");
        ul.innerHTML = "";

        madeqr = false;
        for (ip_ in ips[port_]) {
            let url_ = http + "://" + ip_ + ":" + port_;
            let li = document.createElement("li");
            li.innerHTML = url_;
            ul.appendChild(li);
            if (!madeqr) {
                url = url_;
                makeqr(url);
                changeurl(url);
                document.getElementById("connectedurl").innerHTML = url;
            }
            madeqr = true;
        }
        //socket.disconnect();
    });
}

function checkport(port) {
    getip("http", port);
    getip("https", port);
}

function changeurl(newurl) {
    if (newurl == url) return;
    document.getElementById("connectedurl").innerHTML = url;

    chrome.runtime.sendMessage({
        command: "change url",
        newurl: newurl,
    })

}

document.getElementById("changeport").addEventListener("click", () => {
    let temp_port = document.getElementById("portinput").value;
    checkport(temp_port);
});

var connect = function () {

}

function makeqr(url) {
    document.getElementById("qrcode").innerHTML = "";
    var qrcode = new QRCode("qrcode", {
        text: url,
        width: 128,
        height: 128,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

document.getElementById("getqr").addEventListener("click", () => {

    url = document.getElementById("url");
    var qrcode = new QRCode("qrcode", {
        text: url,
        width: 128,
        height: 128,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
});