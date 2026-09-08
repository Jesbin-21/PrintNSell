import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  

  const handleSubmit = async (e) => {
    e.preventDefault();

  
      if(!email || !password){
   
      alert("All fields required");
      return;
    }

    const formData = {email,password}


    const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData)

    });
    const data = await res.json();

if (data.token) {
  localStorage.setItem("token", data.token)
  navigate("/");
  alert("Welcome!");
  window.location.reload();
}
else{
  alert(data.message)
}

  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Login</h1>
      <input
        type="text"
        placeholder="Email" value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password" value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button text="Submit" onClick={handleSubmit}/>
    </form>
  );
}

export default Login;
