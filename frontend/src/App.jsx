import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [activeRole, setActiveRole] = useState('Student')

  return (
    <main className="login-page">
      <section className="hero-side">
        <div className='hero-title'>
          <h1>
            ILES
          </h1>
          <h4>Internship Logging & Evaluation System</h4>
        </div>
        <div className='title-underline'></div>
        <div className='hero-content'>
          <p>Track weekly logs</p>
          <p>Manage evaluations</p>
          <p>Monitor progress</p>          
        </div>
      </section>

      <section className="form-side">
        <div className='page-title'>
          <h1>Welcome Back</h1>
          <h4>Sign into your account</h4>
        </div>
        <div className="role-selector">
          <button 
            className={activeRole === 'Student' ? 'active-btn' : 'inactive-btn'}
            onClick={() => setActiveRole('Student')}
          >
            Student
          </button>
          <button
            className={activeRole === 'Supervisor' ? 'active-btn' : 'inactive-btn'}
            onClick={() => setActiveRole('Supervisor')}>
            Supervisor
          </button>
          <button
            className={activeRole === 'Administrator' ? 'active-btn' : 'inactive-btn'}
            onClick={() => setActiveRole('Administrator')}
          >
            Administrator
          </button>
        </div>
        <div className="email-input">
          <label> UNIVERSITY EMAIL </label>
          <input type="email" placeholder={activeRole === 'Student' ? 'john.doe@students.mak.ac.ug' : 'staff.member@mak.ac.ug'}></input>
        </div>

        <div className="password-input">
          <div className='label-group'>
            <label> PASSWORD </label>
            <a href=''>Forgot password?</a>
          </div>
          <div className='input-group'>
            <input type="password" placeholder="· · · · · · · · · · ·"></input>
          </div>
        </div>

        <div className="signin-button">
          <button>Sign In</button>
        </div>

        <div className='alt-login'>
          <p>
            <label> Or continue with </label>
          </p>
          
          <button>Gmail</button>
          <button>Phone Number</button>
        </div>

        <div className='sign-up'>
          <label>Don't have an account?</label>
          <a href=''>SIgn Up</a>
        </div>

        <footer>
          <p>
            © 2026 ILES
          </p>
          <p>
            <a href=''>TERMS</a>
            <a href=''>PRIVACY</a>
            <a href=''>HELP</a>
          </p>
        </footer>
        
        
      </section>
    </main>
  )
}

export default App
