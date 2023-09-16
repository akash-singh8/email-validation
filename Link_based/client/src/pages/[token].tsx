import { useRouter } from "next/router";
import style from "@/styles/Verify.module.css";
import { useEffect, useState } from "react";

const verify = () => {
  const router = useRouter();
  const token = router.query.token;

  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    async function getEmail() {
      try {
        const response = await fetch("http://localhost:3080/user/email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userToken: token }),
        });

        console.log(token);
        const data = await response.json();
        if (response.ok) {
          setEmail(data.email);
        } else {
          alert(data.message);
        }
      } catch (err) {
        console.log(err);
      }
    }

    if (token) {
      getEmail();
    }
  }, [token]);

  async function verifyEmail() {
    const response = await fetch("http://localhost:3080/link/verify", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userToken: token }),
    });

    if (response.ok) {
      alert(`${email} verified!`);
    } else {
      const data = await response.json();
      alert(data.message);
    }
  }

  return (
    <div className={style.verify}>
      <div className={style.container}>
        <img src="/confirm.jpg" alt="loda" className={style.image} />
        <h2>Verify your email</h2>
        <p>{email ? email : "Email Not Found"}</p>
        <div>
          <button
            className={`${style.button} ${style.button_confirm}`}
            onClick={() => {
              email ? verifyEmail() : alert("Email Not Found");
            }}>
            Verify
          </button>
          <button
            className={`${style.button} ${style.button_cancle}`}
            onClick={() => {
              window.close();
            }}>
            Cancle
          </button>
        </div>
      </div>
    </div>
  );
};

export default verify;
