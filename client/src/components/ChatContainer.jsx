import React, { useContext, useEffect, useRef, useState } from "react";
import assets, { messagesDummyData } from "../assets/assets";
import { formatmessageTime } from "../lib/utils";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import SmartReplyButton from "./SmartReplyButton";
import { MdKeyboardArrowDown } from "react-icons/md";

const ChatContainer = () => {

  const { 
    messages, 
    selectedUser, 
    setSelectedUser, 
    sendMessage, 
    getMessages, 
    deleteMessage, 
    callUser, 
    call, 
    answerCall, 
    callAccepted, 
    callEnded,
    endCall, 
    formatTime, 
    callTime,
    myAudio,
    userAudio  
  } = useContext(ChatContext)
  const { authUser, onlineUsers} = useContext(AuthContext)

  const scrollEnd = useRef();

  const [input, setInput] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);

  
  //handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return null;
    await sendMessage({text: input.trim()});
    setInput("")  
  }

  //Handle setting an image
  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if(!file || !file.type.startsWith("image/")){
      toast.error("Select an image file")
      return;
    }
    const reader = new FileReader();

    reader.onloadend = async () => {
      await sendMessage({image: reader.result})
      e.target.value = ""
    }
    reader.readAsDataURL(file)
  }
  useEffect(()=>{
    if (selectedUser) {
      getMessages(selectedUser._id)
    }
  },[selectedUser])


  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  },[messages]);

  return (
      <>
        {selectedUser ? (
        <div className="h-full overflow-scroll relative bg-[#EDE0D4]">
          {/*--------header--------- */}
          <div className="flex items-center gap-3 py-3 mx-4 border-b border-[#C2A58B]">
            <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className={`w-8 rounded-full ${!selectedUser.profilePic && 'sepia opacity-70'}`} />
            <p className="flex-1 text-lg text-[#3C1F0D] flex items-center gap-2">
              {selectedUser.fullName}
              {onlineUsers.includes(selectedUser._id) && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
            </p>
            <img
              onClick={() => setSelectedUser(null)}
              src={assets.arrow_icon}
              alt=""
              className="md:hidden max-w-7"
            />


            {/* ++++++++++++++++ */}
            <img
              onClick={() => callUser(selectedUser._id)}
              src={assets.phone_icon}
              alt=""
              className="w-6 h-6 cursor-pointer ml-2 bg-white p-1 rounded-full"
            />
            {/* ++++++++++++++++++++ */}


            <img src={assets.help_icon} alt="" className="max-md:hidden max-w-5" />
          </div>
          {/*------------ chat area --------------- */}
          <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`relative group flex items-end gap-2 justify-end ${
                  msg.senderId !== authUser._id && "flex-row-reverse"
                }`}
              >
                {/* Dropdown Chevron (visible on hover) */}
                <div 
                  onClick={() => setOpenDropdown(openDropdown === msg._id ? null : msg._id)}
                  className={`absolute top-0 right-0 cursor-pointer text-[#8C7B6E] hidden group-hover:block z-10 p-1 bg-gradient-to-bl from-[#EDE0D4]/80 to-transparent rounded-bl-lg`}
                >
                  <MdKeyboardArrowDown size={20} />
                </div>

                {/* WhatsApp-Style Dropdown Menu */}
                {openDropdown === msg._id && (
                  <>
                    {/* Invisible Overlay to handle outside clicks */}
                    <div 
                      className="fixed inset-0 z-20" 
                      onClick={() => setOpenDropdown(null)}
                    ></div>
                    
                    <div className="absolute top-5 right-0 flex-col gap-1 bg-[#D5BDAF] text-[#3C1F0D] rounded shadow-lg z-30 text-xs py-1 min-w-max border border-[#C2A58B]">
                      <button 
                        className="w-full text-left px-3 py-2 hover:bg-[#C2A58B] transition-colors whitespace-nowrap"
                        onClick={() => {
                          deleteMessage(msg._id, false);
                          setOpenDropdown(null);
                        }}
                      >
                        Delete for Me
                      </button>
                      {msg.senderId === authUser._id && (
                        <button 
                          className="w-full text-left px-3 py-2 hover:bg-[#C2A58B] transition-colors whitespace-nowrap"
                          onClick={() => {
                            deleteMessage(msg._id, true);
                            setOpenDropdown(null);
                          }}
                        >
                          Delete for Everyone
                        </button>
                      )}
                    </div>
                  </>
                )}

                {/* Show image or text unless deleted */}
                {msg.isDeleted ? (
                  <p className="text-xs italic text-[#8C7B6E] mb-8">This message was deleted</p>
                ) : msg.image ? (
                  <img src={msg.image} alt="" className="max-w-[230px] border border-[#C2A58B] rounded-lg overflow-hidden mb-8" />
                ) : (
                  <p
                    className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all text-[#3C1F0D] ${
                      msg.senderId === authUser._id
                        ? "rounded-br-none bg-[#C4875A]"
                        : "rounded-bl-none bg-[#F5EFE6]"
                    }`}
                  >
                    {msg.text}
                  </p>
                )}

                {/* Avatar + time */}
                <div className="text-center text-xs">
                  <img
                    src={
                      msg.senderId === authUser._id
                        ? authUser?.profilePic || assets.avatar_icon
                        : selectedUser?.profilePic || assets.avatar_icon
                    }
                    alt=""
                    className={`w-7 rounded-full ${((msg.senderId === authUser._id && !authUser?.profilePic) || (msg.senderId !== authUser._id && !selectedUser?.profilePic)) && 'sepia opacity-70'}`}
                  />
                  <p className="text-gray-500">
                    {formatmessageTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            ))}


            <div ref={scrollEnd}></div>
          </div>

          {/*---------------- bottom area -------------- */}

          {/*---------------- bottom area -------------- */}

          <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-2 p-3 bg-gradient-to-t from-[#EDE0D4] to-transparent">
            <SmartReplyButton 
                selectedUserId={selectedUser._id} 
                onSelectSuggestion={(suggestion) => setInput(suggestion)} 
            />
            <div className="w-full flex items-center bg-[#E3D5CA] px-3 rounded-full border border-[#C2A58B]">
              <input onChange={(e)=> setInput(e.target.value)} value={input} onKeyDown={(e)=> e.key === "Enter" ? handleSendMessage(e) : null} type="text" placeholder="Send a message" className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-[#3C1F0D] placeholder-[#8C7B6E] bg-transparent"/>
              <input onChange={handleSendImage} type="file" id="image" accept="image/png, image/jpg" hidden/>
              <label htmlFor="image">
                <img src={assets.gallery_icon} alt="" className="w-5 mr-2 cursor-pointer"/>
              </label>
              <img onClick={handleSendMessage} src={assets.send_button} alt="" className="w-7 cursor-pointer"/>
            </div>
          </div>
        </div>
    ) : (
      <div className="flex flex-col items-center justify-center gap-4 text-[#8C7B6E] bg-[#EDE0D4] max-md:hidden">
        <img src={assets.logo_icon} alt="" className="max-w-40" />
        <p className="text-xl font-medium text-[#3C1F0D]">Chat anytime, anywhere</p>
      </div>
    )}

    {/* INCOMING CALL */}
          {call?.isReceivingCall && !callAccepted && !callEnded && (
            <div className="absolute inset-0 bg-[#3C1F0D]/95 flex flex-col items-center justify-center text-[#F5EFE6] z-50">
              
              <img
                src={selectedUser?.profilePic || assets.avatar_icon}
                className={`w-24 h-24 rounded-full mb-4 ${!selectedUser?.profilePic && 'sepia opacity-70'}`}
              />

              <h2 className="text-xl font-semibold">
                {call?.name || "Incoming Call"}
              </h2>
              <p className="text-[#C2A58B] mt-2">Incoming Call...</p>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={answerCall}
                  className="bg-green-500 px-6 py-2 rounded-full"
                >
                  Accept
                </button>

                <button
                  onClick={endCall}
                  className="bg-red-500 px-6 py-2 rounded-full"
                >
                  Reject
                </button>
              </div>
            </div>
          )}

          {/* OUTGOING CALL */}
          {call?.isCalling && !callAccepted && !call?.isReceivingCall && (
            <div className="absolute inset-0 bg-[#3C1F0D]/95 flex flex-col items-center justify-center text-[#F5EFE6] z-50">
              
              <img
                src={selectedUser?.profilePic || assets.avatar_icon}
                className={`w-24 h-24 rounded-full mb-4 ${!selectedUser?.profilePic && 'sepia opacity-70'}`}
              />

              <h2 className="text-xl font-semibold">{selectedUser?.fullName}</h2>
              <p className="text-[#C2A58B] mt-2">Calling...</p>

              <button
                onClick={endCall}
                className="mt-6 bg-red-500 px-6 py-2 rounded-full"
              >
                Cancel
              </button>
            </div>
          )}

          {/* CALL CONNECTED */}
          {callAccepted && !callEnded && (
            <div className="absolute inset-0 bg-[#3C1F0D]/95 flex flex-col items-center justify-center text-[#F5EFE6] z-50">
              
              <img
                src={
                  selectedUser?._id === call?.from
                    ? selectedUser?.profilePic
                    : assets.avatar_icon
                }
                className={`w-24 h-24 rounded-full mb-4 ${!(selectedUser?._id === call?.from && selectedUser?.profilePic) && 'sepia opacity-70'}`}
              />

              <h2 className="text-xl font-semibold">{call?.name || selectedUser?.fullName}</h2>
              <p className="text-green-400 mt-2">
                {formatTime(callTime)}
              </p>

              <button
                onClick={endCall}
                className="mt-6 bg-red-500 px-6 py-2 rounded-full"
              >
                End Call
              </button>
            </div>
          )}

          <audio ref={myAudio} autoPlay muted />
          <audio ref={userAudio} autoPlay />
  </>
)};

export default ChatContainer;
