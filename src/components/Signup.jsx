import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";



function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(!email || !password || !confirmPassword){
      alert("Please fill all fields")
      return
    }

    if(password.length < 8){
      alert("Password must be at least 8 characters")
      return

    }

    if(password !== confirmPassword){
      alert("Password must be at least 8 characters");
      return
    }

    try {
      const formData = {email,password,confirmPassword}
      const res = await fetch(`${import.meta.env.VITE_API_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      console.log("Server response:", data);

      if(data.token){
              localStorage.setItem("token",data.token)
                  navigate("/");
      }
      else{
        alert(data.message)
      }



    } catch (error) {
      console.log("Error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Login</h1>

      <input
        type="text"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <Button text="Submit" onClick={handleSubmit}/>
    </form>
  );
}

export default Signup;