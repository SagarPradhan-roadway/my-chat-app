# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


{/* OUTGOING CALL */}
          {call?.isCalling && !callAccepted && !call?.isReceivingCall && (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-white z-50">
              
              <img
                src={selectedUser?.profilePic || assets.avatar_icon}
                className="w-24 h-24 rounded-full mb-4"
              />

              <h2 className="text-xl font-semibold">{selectedUser?.fullName}</h2>
              <p className="text-gray-400 mt-2">Calling...</p>

              <button
                onClick={endCall}
                className="mt-6 bg-red-500 px-6 py-2 rounded-full"
              >
                Cancel
              </button>
            </div>
          )}

          {/* INCOMING CALL */}
          {call?.isReceivingCall && !callAccepted && !callEnded && (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-white z-50">
              
              <img
                src={selectedUser?.profilePic || assets.avatar_icon}
                className="w-24 h-24 rounded-full mb-4"
              />

              <h2 className="text-xl font-semibold">
                {call?.name || "Incoming Call"}
              </h2>
              <p className="text-gray-400 mt-2">Incoming Call...</p>

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

          {/* CALL CONNECTED */}
          {callAccepted && !callEnded && (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-white z-50">
              
              <img
                src={
                  selectedUser?._id === call?.from
                    ? selectedUser?.profilePic
                    : assets.avatar_icon
                }
                className="w-24 h-24 rounded-full mb-4"
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