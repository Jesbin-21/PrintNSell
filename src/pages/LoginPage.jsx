import { useState } from "react";
import Login from "../components/Login";
import Signup from "../components/Signup";
import "./LoginPage.css";
function LoginPage() {
  const [showSignup, setShowSignup] = useState(true);

  return (
    <div className="bdy">
      <div className="container">
        {showSignup?<Login/>:<Signup/>}
        
        <p onClick={()=>setShowSignup(!showSignup)}>{showSignup?"Didn't Signup?" : "Already Signed In?"}</p>
      </div>
    </div>
  );
}

export default LoginPage;
