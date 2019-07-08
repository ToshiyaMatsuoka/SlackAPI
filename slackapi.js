window.onload = () => {
	const button = document.querySelector("#btnStart");
	button.addEventListener("click", () => {
		const messagesContainer = document.querySelector(".messagesContainer");
		messagesContainer.textContent = null;
				getMessages();
	});
};

const getMessages = (last =null) => {
	const request = new XMLHttpRequest();
	const token = "dummy";
	const channelID = "CB74M5Y6B";
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
	const pageElement = document.createElement("div");
	pageElement.className = "page";
	if (!response.ok) {
		alert(response.error);
		return;
	}

	// 新しいものから格納されているので、リストの最後から見ていく
	const messageCount = response.messages.length;
	for (let i = messageCount - 1; i >= 0; i--) {
		const resElement = document.createElement("div");
		resElement.className = "res";
	
		let userUrl =`https://slack.com/api/users.info?token=${token}&user=${response.messages[i].user}`;
		const UserRequest = new XMLHttpRequest();
		UserRequest.open("GET", userUrl,true);
		UserRequest.send(null);	

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
		
		userImg.src=UserResponse.user.profile.image_72;
		
		if(!UserResponse.user.profile.display_name){
			userElement.textContent = UserResponse.user.name;
		}
		else{
			userElement.textContent = UserResponse.user.profile.display_name;
		}
		}
		// 投稿時間
		const timeElement = document.createElement("div");
		timeElement.className = "time";
		timeElement.textContent = new Date(response.messages[i].ts * 1000).toLocaleString();
		
		resElement.appendChild(userImg);
		resElement.appendChild(userElement);
		resElement.appendChild(rowElement);
		resElement.appendChild(timeElement);
		pageElement.appendChild(resElement);
	}
	const messagesContainer = document.querySelector(".messagesContainer");
	if (messagesContainer.childElementCount === 0) {
		messagesContainer.appendChild(pageElement);
	} else {
		// 先頭に追加
		messagesContainer.insertBefore(pageElement, messagesContainer.children[0]);
	}

	if (response.has_more) {
		const messageCount = response.messages.length;
		const oldestTimeStamp = response.messages[messageCount - 1].ts;
		getMessages(oldestTimeStamp);
	}
	}

};


