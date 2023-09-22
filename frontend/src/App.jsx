import { useState } from "react"
import "./style.css"
import {useGoogleLogin} from "@react-oauth/google"
import axios from "axios"
import Modal from "./Modal"


export default function App() {
  const [buttonPopup, setButtonPopup] = useState(false);
  const [signedIn, setSignedIn] = useState(false)
  const [currentTitle, setCurrentTitle] = useState("")
  const [newItem, setNewItem] = useState("")
  const [tasks, setTasks] = useState([])
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
 
  function alertCalendar(title) {
    if (!signedIn) {
      alert("Please sign in to add task to Google Calendar!");
    }
    else {
      setCurrentTitle(title)
      setButtonPopup(true);
    }  
  }
  const login = useGoogleLogin({
    onSuccess: async ({ code }) => {
      await axios.post('http://localhost:3000/auth/google', {  
        code,
      });
      setSignedIn(true)
    },
    scope: 'https://www.googleapis.com/auth/calendar',
    flow: 'auth-code',
  })
 

  
  function handleSubmit(e) {
    e.preventDefault()
    const inputForm = document.getElementById("task-input")
    if (!inputForm.value) {
      alert("Please enter a task")
    }
    else { 
    setTasks(currentTasks => {
      return [
        ...currentTasks,
        { id: crypto.randomUUID(), title: newItem, edit: "Edit", readOnly: true},
      ]
    })
    setNewItem("")
    }
  }

  function deleteTask(id) {
    setTasks(currentTasks => {
      return currentTasks.filter(task => task.id !== id)
      })
  }

  function editTask(id) {
    setTasks(currentTasks => {
      return currentTasks.map(task => {
        if (task.id === id && task.edit === "Edit") {
          return {...task, edit: "Save", readOnly: false}
        }
        else if (task.id === id && task.edit === "Save") {
          return {...task, edit: "Edit", readOnly: true}
        }
        return task
      })
    })
  }


  function changeTitle(e, id) {
    setTasks(currentTasks => {
      return currentTasks.map(task => {
        if (task.id === id) {
          return {...task, title: e}
        }
        return task
      })
    })
  }

  

  
  const handleForm = (e) => {
    e.preventDefault()
    axios.post('http://localhost:3000/create-event', {currentTitle, startTime, endTime})
    alert("Task successfully added to Google Calendar!")
  }

  
  return (
    <>
<header >
  <div>
    <button id="sign-in" className="sign-in" onClick={() => login()} style={{color: '#000000'}}>
      <img id="google-logo" src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/2008px-Google_%22G%22_Logo.svg.png"></img>
      Sign in to add tasks to Google Calendar
    </button>
  </div>
    <h1>To Do List</h1>
   <div className="container">
       <form id="input-form" onSubmit={handleSubmit}>
           <input value={newItem} onChange={e => setNewItem(e.target.value)} type="text" id="task-input" placeholder="Enter your tasks here" />
           <input type="submit" id="add-task" value="Add Task"/>
       </form>
       
   </div>
  <h2 id="h2">Tasks</h2> 
</header>
    {tasks.map(task => {
      return ( <div className="task" id="task" key={task.id}>
      <input type="checkbox" className="check" id="2" onClick={() => deleteTask(task.id)}/>
      <input id="task-text-input" value={task.title} readOnly={task.readOnly} onChange={e => changeTitle(e.target.value, task.id)}></input>
      <button id="calendar" onClick={() => alertCalendar(task.title)}>Calendar</button>
      <button id="edit" onClick={() => editTask(task.id)}>{task.edit}</button>
      <Modal trigger={buttonPopup} setTrigger={setButtonPopup} onClick={currentTitle}>
        <form onSubmit={handleForm}>
          <label htmlFor="start">Start time:</label>
          <input type="datetime-local" id="start" name="task-start" value={startTime} onChange={e =>setStartTime(e.target.value)}/>
          <br></br>
          <label htmlFor="end">End time:</label>
          <input type="datetime-local" id="end" name="task-end" value={endTime} onChange={e =>setEndTime(e.target.value)}/>
          <button type='submit' id="add-task-calendar">Add to Calendar</button>
        </form>
        
      </Modal>
      </div>
      )
    })}

    
    </>
  )
}
