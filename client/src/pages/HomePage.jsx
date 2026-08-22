import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import ChatContainer from '../components/ChatContainer'
import RightSidebar from '../components/RightSidebar'
import { useContext } from 'react'
import { ChatContext } from '../../context/ChatContext'

const HomePage = () => {

  const {selectedUser, myAudio, userAudio} = useContext(ChatContext)

  return (
    <div className='w-full h-screen bg-[#F5EFE6]'>
      <audio ref={myAudio} autoPlay muted />
      <audio ref={userAudio} autoPlay />
        <div className={`bg-[#EDE0D4] overflow-hidden h-full grid grid-cols-1 relative shadow-xl ${selectedUser ? 'md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]' : 'md:grid-cols-2'}`}>
          <Sidebar />
          <ChatContainer />
          <RightSidebar />
        </div>
    </div>
  )
}

export default HomePage