import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const Login = () => {
  const [err, setErr] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [eyebtn, setEyebtn] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    setLoading(true);
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err: any) {
      if (err.code === "auth/invalid-email") setErrMsg("Invalid Email");
      if (err.code === "auth/user-not-found") setErrMsg("Account Not Exist");
      if (err.code === "auth/wrong-password") setErrMsg("Wrong Password");
      setErr(true);
      setLoading(false);
    }
  };
  const handleEyebtn = () => {
    setEyebtn(!eyebtn);
  };

  return (
    <div className="wrapper">
      <section className="form login">
        <header>MoMo Chat</header>
        <form onSubmit={handleSubmit}>
          {err && <div className="error-text">{errMsg}</div>}
          <div className="field input">
            <label>Email Address</label>
            <input
              type="text"
              name="email"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="field input">
            <label>Password</label>
            <input
              type={eyebtn ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              required
            />
            <div className="eye-btn" onClick={handleEyebtn}>
              <i
                className={`fa-regular ${eyebtn ? "fa-eye" : "fa-eye-slash"}`}
              ></i>
            </div>
          </div>

          <div className="field button">
            <input
              type="submit"
              name="submit"
              value={loading ? "Loading please wait..." : "Continue to Chat"}
              disabled={loading ? true : false}
            />
          </div>
        </form>
        <div className="link">
          Not yet signed up? <Link to="/register">Signup now</Link>
        </div>
      </section>
    </div>
  );
};

export default Login;
