import { use, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Login(){
    const [formData, setFormData] = useState({
        email:"",
        password:""
    });
    const {login} = useAuth();
    const navigate = useNavigate();
    function handleChange(event){
        setFormData({
            ...formData,
            [event.target.name]:event.target.value
        });
    }
    async function handleSubmit(event){
        event.preventDefault();
        try{
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    email:formData.email,
                    password:formData.password
                })
            });
            const data = await response.json();
            if(!response.ok){
                alert(data.message || "Login failed");
                return;
            }
            //store user details and jwt token
            login(data.user, data.token);
            //navigate to chat page
            navigate("/chat");
        }catch(error){
            console.error("Login error:", error);
            alert("Unable to connect to the server");
        }
    }
    return(
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>Welcome back!</h2>
                <p>Login to your connect chat account</p>
                <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required/>
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                <button type="submit">Login</button>
                <p>Don't have an account?<Link to="/register">Register</Link></p>
            </form>
        </div>
    );
}
export default Login;
