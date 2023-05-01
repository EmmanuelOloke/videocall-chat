# Video Call App with Chat Functionality

Built with React, Chakra-UI and Simple-Peer - A wrapper for WebRTC API

To run the app: Clone the repo, cd into the directory and run `npm install` to install all the server/backend dependecies. Keep the terminal open and open a separate terminal in the same directory.

In the new terminal: cd into `frontend` and also run `npm install` to install all the frontend dependencies.

Back in the main project directory: Run `npm run dev` to start the `nodemon` server running on `port 3000`

In the frontend directory terminal: Also run `npm run dev` to start the frontend server. Which is `vite` in this case.

Visit the vite localhost url in your browser and the project should now be up and running. Then you can play with the app however you want.

## Problems to fix

There seem to be some issues with the `simple-peer` npm package being used in this project. I've tried to revert to an older version but still get the same error when a user tries to initialise a call.

Possible fix will be to probably use a different WebRTC API package apart from `simple-peer`. Work in progress...
