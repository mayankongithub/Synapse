# 🎉 SYNAPSE - Local Folder Mode

## ✅ Setup Complete!

Your Synapse AI Developer Agent is now configured to work with **local folders only** - no git, no deployment needed!

---

## 🚀 How to Use

### Step 1: Start the Backend
```bash
cd dev-agent/backend
npm start
```
Backend will run on: `http://localhost:5002`

### Step 2: Start the Frontend
```bash
cd dev-agent/frontend
npm run dev
```
Frontend will run on: `http://localhost:3002` (or next available port)

### Step 3: Pick a Local Folder

In the frontend, you have **2 ways** to select a folder:

#### Option A: Use the Folder Picker Button
- Click **"📂 Open Folder"** button
- Select a folder from your computer
- Browser will ask for permission (grant it)

#### Option B: Paste Folder Path
- In the text input below the button, paste your folder path
- Example: `/Users/yourname/my-project`
- Click the **✓** button

### Step 4: Start Working!
- Files from your folder will appear in the left sidebar
- Click any file to edit it
- Use **Cmd+K** to chat with AI
- Use **Cmd+J** to see terminal output
- Use **Cmd+B** to toggle file explorer

---

## 📁 What Works

✅ **Read Files** - Open and view any file from your folder  
✅ **Edit Files** - Make changes and save them  
✅ **Create Files** - Create new files in your folder  
✅ **Delete Files** - Remove files from your folder  
✅ **Run Code** - Execute JavaScript, Python, C++, Java, etc.  
✅ **AI Chat** - Ask AI to help with your code  
✅ **Code Conversion** - Convert code between languages  

---

## 🔧 API Endpoints

All endpoints work with the selected folder:

- `GET /api/health` - Check if backend is running
- `POST /api/set-workspace` - Set the folder path
- `GET /api/workspace` - Get current folder path
- `GET /api/files` - List all files in folder
- `GET /api/files/:fileName` - Read a specific file
- `POST /api/files` - Create/update a file
- `DELETE /api/files/:fileName` - Delete a file
- `POST /api/run` - Run code
- `POST /api/chat` - Chat with AI
- `POST /api/convert` - Convert code

---

## 💡 Example Workflow

1. **Start both servers** (backend + frontend)
2. **Paste folder path**: `/Users/yourname/my-project`
3. **Click ✓** to load the folder
4. **Select a file** from the sidebar
5. **Edit the file** in the editor
6. **Ask AI**: "Fix this code" or "Add error handling"
7. **Run code**: Click the play button to execute
8. **See results** in the terminal

---

## 🎯 No Git, No Deployment

- ✅ Everything runs **locally**
- ✅ No git commits needed
- ✅ No deployment required
- ✅ Works **offline** (except AI features)
- ✅ All files stay in your folder

---

**Happy coding! 🚀**

