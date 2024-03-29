﻿window.onload = () => {
	const token = "dummy";
	const channelID = "CB74M5Y6B";
	const button = document.querySelector("#sender");
	const userUrl = `https://slack.com/api/users.list?token=${token}`;
	
	button.addEventListener("click",sendMessage(token,channelID));
	const messagesContainer = document.querySelector(".messagesContainer");
	messagesContainer.textContent = null;
	const UserRequest = new XMLHttpRequest();
	UserRequest.open("GET", userUrl,true);
	UserRequest.send(null);	
	UserRequest.onload=()=>{
	const UserResponse = JSON.parse(UserRequest.responseText);

	getMessages(token,channelID,UserResponse);
	}
};
const getMessages = (token,channelID,UserResponse,last =null) => {
	const request = new XMLHttpRequest();
	let url = `https://slack.com/api/channels.history?token=${token}&channel=${channelID}&count=10`;
	if(last){
		url += `&latest=${last}`;
	}
	else{
		url += `&latest=${Date.now()}`;
	}
	request.open("GET", url,true);
	request.send(null);

	request.onload = () => {

	const response = JSON.parse(request.responseText);
	SetMessases(response,UserResponse);
		if (response.has_more) {
			const messageCount = response.messages.length;
			const oldestTimeStamp = response.messages[messageCount - 1].ts;
			getMessages(token,channelID,UserResponse,oldestTimeStamp);
		}
	}

};

const SetMessases = (response,UserResponse) => {

	const pageElement = document.createElement("div");
	pageElement.className = "page";

	// 新しいものから格納されているので、リストの最後から見ていく
	const messageCount = response.messages.length;
	for (let i = messageCount - 1; i >= 0; i--) {
		const resElement = document.createElement("div");
		resElement.className = "res";
	
		PutElement(UserResponse,response,i,resElement)
		pageElement.appendChild(resElement);
	}
	const messagesContainer = document.querySelector(".messagesContainer");
	if (messagesContainer.childElementCount === 0) {
		messagesContainer.appendChild(pageElement);
	} else {
		// 先頭に追加
		messagesContainer.insertBefore(pageElement, messagesContainer.children[0]);
		messagesContainer.scrollBy(0,10000);
	}
};

const PutElement=(UserResponse,response,i,resElement)=>{
	let isMine = "";
	if("UB6EXC17U" == response.messages[i].user){
		isMine = "mine";
	}

	// メッセージ本文
	const messageElement = document.createElement("div");
	messageElement.className = "message";
	messageElement.innerText  = response.messages[i].text;
	const textLength = response.messages[i].text.length;
	msgWidth =textLength < 40 ? `${textLength}em` : "100%";
	
	// メッセージを囲む枠
	const rowElement = document.createElement("div");
	rowElement.className = isMine + "row";
	rowWidth =textLength < 40 ? `${textLength + 2}em` : "60%";

	if(window.innerWidth<1150){
		msgWidth = "100%";
		rowWidth = "60%";
	}
	messageElement.style.width = msgWidth;
	rowElement.style.width = rowWidth;
	rowElement.appendChild(messageElement);

	const userElement = document.createElement("div");
	const userImg = document.createElement("img");
	userElement.className = isMine + "user";
	userImg.className = isMine + "userImg";
	let userID = GetUserIndex(response,i,UserResponse);
	var menber = UserResponse.members[userID]
	if(menber){
		userImg.src=menber.profile.image_72;
	
		if(!menber.profile.display_name){
			userElement.textContent = menber.name;
		}
		else{
			userElement.textContent = menber.profile.display_name;
		}
	}
	else{
		userElement.textContent="BOT";
	}
	// 投稿時間
	const timeElement = document.createElement("div");
	timeElement.className = isMine+"time";
	const time = new Date(response.messages[i].ts * 1000);
	var timeStr = time.getHours() < 12 ? `午前 ${time.getHours()}:` : `午後 ${time.getHours() - 12}:`;
	timeStr += time.getMinutes() <10 ? `0${time.getMinutes()}`:time.getMinutes();
	timeElement.textContent = timeStr;
	if("mine" === isMine){
		resElement.appendChild(userElement);
		resElement.appendChild(userImg);
		let elmleft = textLength < 40 ? `${58-textLength}em` : "30%";
		if(window.innerWidth<1150){
			elmleft = "30%";
		}
		rowElement.style.left = elmleft;
		timeElement.style.left = elmleft;
	}		
	else{
		resElement.appendChild(userImg);
		resElement.appendChild(userElement);
		timeElement.style.right = textLength < 40 ? `${65-textLength}em` : "35%"
	}
	resElement.appendChild(rowElement);
	resElement.appendChild(timeElement);
};
const GetUserIndex =(response,i,UserResponse)=>{
	for(j=0;j<UserResponse.members.length;j++){
		if(response.messages[i].user == UserResponse.members[j].id){
			return j;
		}
	}
}
const sendMessage=(token,channelID)=>{
	const text = sessionStorage.getItem("textData");
	if(!text) return;
	const postUrl = `https://slack.com/api/chat.postMessage?token=${token}&channel=${channelID}&text=${text}`;
	const request = new XMLHttpRequest();
	sessionStorage.removeItem("textData");
	request.open("GET", postUrl,true);
	request.send(null);
};
const SaveText = ($this) => {
	sessionStorage.setItem("textData", $this.value);
}
const transPage = () => {
	sessionStorage.removeItem("textData");
}
