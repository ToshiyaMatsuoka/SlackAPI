window.onload = () => {
	const token = "dummy";
	const channelID = "CB74M5Y6B";
	const button = document.querySelector("#sender");
	
	button.addEventListener("click",sendMessage(token,channelID));
	const messagesContainer = document.querySelector(".messagesContainer");
	messagesContainer.textContent = null;
	let userUrl = `https://slack.com/api/users.list?token=${token}`;
	const UserRequest = new XMLHttpRequest();
	UserRequest.open("GET", userUrl,true);
	UserRequest.send(null);	
	UserRequest.onload=()=>{
	getMessages(token,channelID,UserRequest);
	}
};
const getMessages = (token,channelID,UserRequest,last =null) => {
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
	SetMessases(response,UserRequest);
		if (response.has_more) {
			const messageCount = response.messages.length;
			const oldestTimeStamp = response.messages[messageCount - 1].ts;
			getMessages(token,channelID,UserRequest,oldestTimeStamp);
		}
	}

};

const SetMessases = (response,UserRequest) => {

	const pageElement = document.createElement("div");
	pageElement.className = "page";
	const UserResponse = JSON.parse(UserRequest.responseText);

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
	// メッセージを囲む枠
	const rowElement = document.createElement("div");
	rowElement.className = isMine + "row";
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
	}		
	else{
		resElement.appendChild(userImg);
		resElement.appendChild(userElement);
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
	let postUrl = `https://slack.com/api/chat.postMessage?token=${token}&channel=${channelID}&text=${text}`;
	const request = new XMLHttpRequest();
	sessionStorage.removeItem("textData");
	request.open("POST", postUrl,true);
	request.send(null);
};
const alertValue = ($this) => {
	sessionStorage.setItem("textData", $this.value);
}

