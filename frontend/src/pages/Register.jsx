import { useState } from "react";
import { Link } from "react-router-dom";

function Register(){
    const  [formData,  setFormData] = useState({
        name:"",
        email:"",
        password:"",
        confirmPassword:""
    });
    function handleChange(event){
        setFormData({
            ...formData,
            [event.target.name]:event.target.value
        });
    }
    async function handleSubmit(event){
        event.preventDefault();
        if(formData.password!==formData.confirmPassword){
            alert("Passwords do not match!");
            return;
        }
        try{
            const response = await fetch("http://localhost:5000/api/auth/register", {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    name:formData.name,
                    email:formData.email,
                    password:formData.password
                })
            });
            const data = await response.json();
            if(!response.ok){
                alert(data.message || "Registration failed");
                return;
            }
            alert("Registration successful!");
            console.log(data);
        }catch(error){
            console.error("Registration error:", error);
            alert("Unable to connect to the server");
        }
    }
    return(
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>Create Account</h2>
                <p>Join connect chat today!</p>
                <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required/>
                <input type="email" name="email" placeholder="Emial Address" value={formData.email} onChange={handleChange} required/>
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required/>
                <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required/>
                <button type="submit">Register</button>
                <p>
                    Already have an account?<Link to="/login">Login</Link>
                </p>
            </form>
        </div>
    );
}
export default Register;