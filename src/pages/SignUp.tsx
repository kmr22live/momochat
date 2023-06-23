import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db, storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useNavigate, Link } from "react-router-dom";
import {
  collection,
  query,
  setDoc,
  where,
  getDocs,
  doc,
} from "firebase/firestore";

const Register = () => {
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [eyebtn, setEyebtn] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (data: string) => {
    const q = query(collection(db, "users"), where("displayName", "==", data));

    try {
      const querySnapshot = await getDocs(q);
      // await console.log(querySnapshot);
      let newdata = [];
      querySnapshot.forEach((doc) => {
        newdata.push(doc.data());
      });
      return newdata.length > 0;
    } catch (err) {
      // setErr(true);

      return false;
    }
    // console.log(user);
  };

  const handleSubmit = async (e: any) => {
    setLoading(true);
    e.preventDefault();
    const displayName = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;
    const file = e.target[3].files[0];
    let duplicateornot = await handleSearch(e.target[0].value);

    if (!duplicateornot) {
      try {
        const res = await createUserWithEmailAndPassword(auth, email, password);

        const date = new Date().getTime();
        const storageRef = ref(storage, `${displayName + date}`);

        await uploadBytesResumable(storageRef, file).then(() => {
          getDownloadURL(storageRef).then(async (downloadURL) => {
            try {
              await updateProfile(res.user, {
                displayName,
                photoURL: downloadURL,
              });
              await setDoc(doc(db, "users", res.user.uid), {
                uid: res.user.uid,
                displayName,
                email,
                photoURL: downloadURL,
              });

              await setDoc(doc(db, "userChats", res.user.uid), {});
              navigate("/");
            } catch (err) {
              setErr(true);
              setLoading(false);
            }
          });
        });
      } catch (err: any) {
        if (err.code === "auth/invalid-email") setErrMsg("Invalid Email");
        if (err.code === "auth/email-already-in-use")
          setErrMsg("Account Already Exist");
        if (err.code === "auth/weak-password")
          setErrMsg("Enter Password min 6 Character");
        setErr(true);
        setLoading(false);
      }
    } else {
      setErrMsg("Username Already Exist");
      setErr(true);
      setLoading(false);
    }
  };
  const handleEyebtn = () => {
    setEyebtn(!eyebtn);
  };

  return (
    <>
      <div className="wrapper">
        <section className="form signup">
          <header>MoMo Chat</header>
          <form onSubmit={handleSubmit}>
            {err && <div className="error-text">{errMsg}</div>}

            <div className="field input">
              <label>Username</label>
              <input
                type="text"
                name="displayname"
                placeholder="Display name"
                required
              />
            </div>

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
                placeholder="Enter new password"
                required
              />
              <div className="eye-btn" onClick={handleEyebtn}>
                <i
                  className={`fa-regular ${eyebtn ? "fa-eye" : "fa-eye-slash"}`}
                ></i>
              </div>
            </div>
            <div className="field image">
              <label>Select Avatar</label>
              <input
                type="file"
                name="image"
                accept="image/x-png,image/gif,image/jpeg,image/jpg"
                required
              />
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
            Already signed up? <Link to="/login">Login now</Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default Register;
