document.getElementById("subchan").onclick = () => {
    text = document.getElementById("textchan").value
    if(text == ""){
      document.getElementById("thanchan").innerHTML = ""
      return;
    }
    data = "&text1="+encodeURIComponent(text)+"&Submit2="+1+"&id="+1084712
    
    var s = document.createElement("script");
    s.hidden = true
    s.src = "https://form1ssl.fc2.com/parts/?_callback=" + ";" + "&" + data;
    document.body.appendChild(s);

    document.getElementById("textchan").value = ""
    document.getElementById("thanchan").innerHTML = "sent!"
    setTimeout(()=>{document.getElementById("thanchan").innerHTML = ""}, 1000)
    
  }