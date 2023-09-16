import style from "@/styles/Verify.module.css"

const verify = () => {
    return <div className={style.verify}>
        <div className={style.container}>
            <img src="/confirm.jpg" alt="loda" className={style.image} />
            <h2>Verify your email</h2>
            <p>developer.akash8@gmail.com</p>
            <div>
                <button className={`${style.button} ${style.button_confirm}`}>Verify</button>
                <button className={`${style.button} ${style.button_cancle}`}>Cancle</button>
            </div>
        </div>
    </div>
}

export default verify;