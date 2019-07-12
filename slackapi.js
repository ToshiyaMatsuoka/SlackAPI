window.onload = () => {
	const token = "dummy";
	const channelID = "CB74M5Y6B";
	const button = document.querySelector("#sender");
	
	button.addEventListener("click",sendMessage(token,channelID));
	const messagesContainer = document.querySelector(".messagesContainer");
	messagesContainer.textContent = null;
	getMessages(token,channelID);
};
const getMessages = (token,channelID,last =null) => {
	const request = new XMLHttpRequest();
	let url = `https://slack.com/api/channels.history?token=${token}&channel=${channelID}&count=10`;
	if(last){
		url+=`&latest=${last}`;
	}
	else{
		url+=`&latest=${Date.now()}`;
	}
	request.open("GET", url,true);
	request.send(null);

	request.onload = () => {

	const response = JSON.parse(request.responseText);
	SetMessases(response,token);
	if (response.has_more) {
		const messageCount = response.messages.length;
		const oldestTimeStamp = response.messages[messageCount - 1].ts;
		getMessages(token,channelID,oldestTimeStamp);
	}
	}

};

const SetMessases = (response,token) => {

	const pageElement = document.createElement("div");
	pageElement.className = "page";

	// 新しいものから格納されているので、リストの最後から見ていく
	const messageCount = response.messages.length;
	for (let i = messageCount - 1; i >= 0; i--) {
		const resElement = document.createElement("div");
		resElement.className = "res";
	
		let userUrl =`https://slack.com/api/users.info?token=${token}&user=${response.messages[i].user}`;
		const UserRequest = new XMLHttpRequest();
		UserRequest.open("GET", userUrl,true);
		UserRequest.send(null);	
		if("UB6EXC17U"==response.messages[i].user){
			putMine(UserRequest,response,i,resElement);
		}
		else put(UserRequest,response,i,resElement);
		
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

const put=(UserRequest,response,i,resElement)=>{
			// メッセージ本文
			const messageElement = document.createElement("div");
			messageElement.className = "message";
			messageElement.textContent = response.messages[i].text;
	
			// メッセージを囲む枠
			const rowElement = document.createElement("div");
			rowElement.className = "row";
			rowElement.appendChild(messageElement);
	
			const userElement = document.createElement("div");
			const userImg = document.createElement("img");
			UserRequest.onload=()=>{
			userElement.className = "user";
			userImg.className = "userImg";
			const UserResponse = JSON.parse(UserRequest.responseText);
			if(UserResponse.user){
			userImg.src=UserResponse.user.profile.image_72;
			
				if(!UserResponse.user.profile.display_name){
					userElement.textContent = UserResponse.user.name;
				}
				else{
					userElement.textContent = UserResponse.user.profile.display_name;
				}
			}
			}
			// 投稿時間
			const timeElement = document.createElement("div");
			timeElement.className = "time";
			const time =new Date(response.messages[i].ts * 1000);
			var timeStr=time.getHours() < 12 ? `午前 ${time.getHours()}:` : `午後 ${time.getHours() - 12}:`;
			timeStr+= time.getMinutes() <10 ? `0${time.getMinutes()}`:time.getMinutes();
			timeElement.textContent = timeStr;
			resElement.appendChild(userImg);
		resElement.appendChild(userElement);
		resElement.appendChild(rowElement);
		resElement.appendChild(timeElement);
};
const putMine=(UserRequest,response,i,resElement)=>{
	// メッセージ本文
	const messageElement = document.createElement("div");
	messageElement.className = "message";
	messageElement.textContent = response.messages[i].text;

	// メッセージを囲む枠
	const rowElement = document.createElement("div");
	rowElement.className = "myRow";
	rowElement.appendChild(messageElement);

	const userElement = document.createElement("div");
	const userImg = document.createElement("img");
	UserRequest.onload=()=>{
	userElement.className = "myUser";
	userImg.className = "myUserImg";
	const UserResponse = JSON.parse(UserRequest.responseText);
	
	if(UserResponse.user){
		userImg.src=UserResponse.user.profile.image_72;
		
			if(!UserResponse.user.profile.display_name){
				userElement.textContent = UserResponse.user.name;
			}
			else{
				userElement.textContent = UserResponse.user.profile.display_name;
			}
		}

	}
	// 投稿時間
	const timeElement = document.createElement("div");
	timeElement.className = "myTime";
	const time =new Date(response.messages[i].ts * 1000);
	var timeStr=time.getHours() < 12 ? `午前 ${time.getHours()}:` : `午後 ${time.getHours() - 12}:`;
	timeStr+= time.getMinutes() <10 ? `0${time.getMinutes()}`:time.getMinutes();
	timeElement.textContent = timeStr;
	resElement.appendChild(userElement);
	resElement.appendChild(userImg);
resElement.appendChild(rowElement);
resElement.appendChild(timeElement);

};

const sendMessage=(token,channelID)=>{
	const text = sessionStorage.getItem("textData");
	if(!text) return;
	let postUrl = `https://slack.com/api/chat.postMessage?token=${token}&channel=${channelID}&text=${text}`;
	const request = new XMLHttpRequest();
	sessionStorage.removeItem("textData")
	request.open("POST", postUrl,true);
	request.send(null);
};
const alertValue = ($this) => {
	sessionStorage.setItem("textData", $this.value);
}

