import { FunctionComponent, useMemo, type CSSProperties } from "react";
import { TextField } from "@mui/material";
import "./login.frame.css";
// import "."

import {Logo} from "../../assets/images";


export type FrameComponentType = {
  className?: string;
  headquarters?: string;
  signInButton?: string;
  qiqNewLogos1?: string;

  /** Style props */
  frameDivMargin?: CSSProperties["margin"];
  frameDivTextDecoration?: CSSProperties["textDecoration"];
  frameDivMargin1?: CSSProperties["margin"];
  frameDivTextDecoration1?: CSSProperties["textDecoration"];
};

const FrameComponent: FunctionComponent<FrameComponentType> = ({
  className = "",
  headquarters,
  signInButton,
//   qiqNewLogos1,
  frameDivMargin,
  frameDivTextDecoration,
  frameDivMargin1,
  frameDivTextDecoration1,
}) => {
  const lMSPORTALStyle: CSSProperties = useMemo(() => {
    return {
      margin: frameDivMargin,
      textDecoration: frameDivTextDecoration,
      
    };
  }, [frameDivMargin, frameDivTextDecoration]);

  const signInStyle: CSSProperties = useMemo(() => {
    return {
      margin: frameDivMargin1,
      textDecoration: frameDivTextDecoration1,
    };
  }, [frameDivMargin1, frameDivTextDecoration1]);

  return (
    <section className={`rectangle-parent ${className}`}>
      <div className="frame-child" />
      <div className="lms-portal-wrapper">
        <h1 className="lms-portal" style={lMSPORTALStyle}>
          LMS PORTAL
        </h1>
      </div>
      <div className="frame-parent">
        <form className="frame-group">
          <div className="sign-in-wrapper">
            <h1 className="sign-in" style={signInStyle}>
              Sign in
            </h1>
          </div>
          <div className="email-parent">
            <b className="email">Email</b>
            <TextField
              className="frame-item"
              placeholder="Please enter your email"
              variant="outlined"
              sx={{
                "& fieldset": { borderColor: "#66c1fc" },
                "& .MuiInputBase-root": {
                  height: "28px",
                  backgroundColor: "#fff",
                  borderRadius: "5px",
                  fontSize: "10px",
                },
                "& .MuiInputBase-input": { color: "#c1c1c1" },
              }}
            />
          </div>
          <div className="password-parent">
            <b className="password">Password</b>
            <TextField
              className="forgot-password"
              placeholder="Please enter your password"
              variant="outlined"
              sx={{
                "& fieldset": { borderColor: "#66c1fc" },
                "& .MuiInputBase-root": {
                  height: "28px",
                  backgroundColor: "#fff",
                  borderRadius: "5px",
                  fontSize: "10px",
                },
                "& .MuiInputBase-input": { color: "#c1c1c1" },
              }}
            />
            <i className="forgot-password1">Forgot Password?</i>
          </div>
          <div className="branch-parent">
            <b className="branch">Branch</b>
            <div className="rectangle-group">
              <div className="frame-inner" />
              <div className="headquarters">{headquarters}</div>
              <div className="sign-in-button-wrapper">
                <img className="sign-in-button" alt="" src={signInButton} />
              </div>
            </div>
          </div>
          <button className="rectangle-container">
            <div className="rectangle-div" />
            <b className="sign-in1">Sign in</b>
          </button>
        </form>
        <div className="logo-wrapper">
          <div className="logo" />
        </div>
        <div className="qiq-newlogos-1-wrapper">
          <img
            className="qiq-newlogos-1-icon"
            loading="lazy"
            alt=""
            src={Logo}
          />
        </div>
      </div>
    </section>
  );
};

// import st from ""
export default FrameComponent;
