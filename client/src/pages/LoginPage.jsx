import React, { useContext, useState, useEffect } from "react";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign Up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);

  // ++++++++++++++++++++++++++++
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1=email, 2=otp+password
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // ++++++++++++++++++++++++++++++

  const { login } = useContext(AuthContext);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (currState === "Sign Up" && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }

    // ✅ Forgot Password Logic
    //   if (currState === "Forgot") {
    //     if (password !== confirmPassword) {
    //       return toast.error("Passwords do not match");
    //     }

    //     await axios.post("/api/auth/reset-password-direct", {
    //       email,
    //       password
    //     });

    //     toast.success("Password updated successfully");
    //     setCurrState("Login");
    //     return;
    //   }

    //   login(currState === "Sign Up" ? 'signup' : 'login', {fullName, email, password, bio})
    // }

    // ++++++++++++++++++++++++++++++++++++
    // ✅ Forgot Password Logic
    if (currState === "Forgot") {
      // STEP 1 → Send OTP
      if (step === 1) {
        try {
          setLoading(true);

          const { data } = await axios.post("/api/auth/send-otp", { email });

          if (data.success) {
            toast.success("OTP sent to your email");
            setStep(2);
            setOtpSent(true);
            setTimer(60); // 60 sec cooldown
          } else {
            toast.error(data.message);
          }
        } catch (error) {
          toast.error("Something went wrong");
        } finally {
          setLoading(false);
        }

        return;
      }

      // STEP 2 → Verify OTP + Reset Password
      if (step === 2) {
        if (password !== confirmPassword) {
          return toast.error("Passwords do not match");
        }

        const { data } = await axios.post("/api/auth/verify-otp", {
          email,
          otp,
          password,
        });

        if (data.success) {
          toast.success("Password updated successfully");
          setCurrState("Login");
          setStep(1);
        } else {
          toast.error(data.message);
        }

        return;
      }
    }
    login(currState === "Sign Up" ? "signup" : "login", {
      fullName,
      email,
      password,
      bio,
    });
  };

  useEffect(() => {
    let interval;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timer]);
  // ++++++++++++++++++++++++++++++++++

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl">
      <img src={assets.logo_big} alt="" className="w-[min(30vw,250px)]" />

      <form
        onSubmit={onSubmitHandler}
        className="border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col rounded-lg shadow-lg w-1/3"
      >
        <h2 className="font-medium text-2xl flex justify-between items-center">
          {currState}
          {isDataSubmitted && (
            <img
              onClick={() => setIsDataSubmitted(false)}
              src={assets.arrow_icon}
              alt=""
              className="w-5 cursor-pointer"
            />
          )}
        </h2>

        <br />

        {/* Signup Name */}
        {currState === "Sign Up" && !isDataSubmitted && (
          <input
            onChange={(e) => setFullName(e.target.value)}
            value={fullName}
            type="text"
            placeholder="Full Name"
            required
            className="p-2 border border-gray-500 rounded-md"
          />
        )}

        <br />

        {/* Email + Password */}
        {!isDataSubmitted && currState !== "Forgot" && (
          <>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="Email Address"
              required
              className="p-2 border border-gray-500 rounded-md"
            />
            <br />

            <div className="relative">
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                className="p-2 border border-gray-500 rounded-md w-full pr-10"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </>
        )}

        {/* Forgot Password Fields */}
        {/* {currState === "Forgot" && (
          <>
            <input 
              type="email"
              placeholder="Enter your email"
              onChange={(e)=>setEmail(e.target.value)}
              value={email}
              className='p-2 border border-gray-500 rounded-md'
              required
            />
            <br />

            <input 
              type="password"
              placeholder="New Password"
              onChange={(e)=>setPassword(e.target.value)}
              value={password}
              className='p-2 border border-gray-500 rounded-md'
              required
            />
            <br />

            <input 
              type="password"
              placeholder="Confirm Password"
              onChange={(e)=>setConfirmPassword(e.target.value)}
              value={confirmPassword}
              className='p-2 border border-gray-500 rounded-md'
              required
            />
          </>
        )} */}
        {/* ++++++++++++++++++++++ */}
        {currState === "Forgot" && step === 1 && (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="p-2 border border-gray-500 rounded-md"
              required
            />
          </>
        )}

        {currState === "Forgot" && step === 2 && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              onChange={(e) => setOtp(e.target.value)}
              value={otp}
              className="p-2 border border-gray-500 rounded-md"
              required
            />
            <br />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                className="p-2 border border-gray-500 rounded-md w-full pr-10"
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <br />

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
                className="p-2 border border-gray-500 rounded-md w-full pr-10"
                required
              />
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </>
        )}
        {/* ++++++++++++++++++++++++ */}

        <br />

        {/* Bio */}
        {currState === "Sign Up" && isDataSubmitted && (
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            rows={4}
            placeholder="provide a short bio..."
            required
            className="p-2 border border-gray-500 rounded-md"
          ></textarea>
        )}

        <br />

        {/* Forgot Password Link */}
        {currState === "Login" && (
          <p
            onClick={() => {
              setCurrState("Forgot");
              setIsDataSubmitted(false);
            }}
            className="text-sm text-blue-400 cursor-pointer mb-4"
          >
            Forgot Password?
          </p>
        )}

        <button
          type="submit"
          disabled={
            loading || (currState === "Forgot" && step === 1 && timer > 0)
          }
          className={`py-3 rounded-md text-white transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-400 to-violet-600"
          } ${timer > 0 ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {loading
            ? "Sending..."
            : currState === "Sign Up"
              ? "Create Account"
              : currState === "Login"
                ? "Login Now"
                : step === 1
                  ? timer > 0
                    ? `Resend OTP in ${timer}s`
                    : "Send OTP"
                  : "Reset Password"}
        </button>

        <br />

        {/* Bottom Toggle */}
        <div className="flex flex-col gap-2 text-sm text-gray-600">
          {currState === "Sign Up" ? (
            <p>
              Already have an account?
              <span
                onClick={() => {
                  setCurrState("Login");
                  setIsDataSubmitted(false);
                }}
                className="text-violet-500 cursor-pointer"
              >
                {" "}
                Login here
              </span>
            </p>
          ) : currState === "Login" ? (
            <p>
              Create an account
              <span
                onClick={() => setCurrState("Sign Up")}
                className="text-violet-500 cursor-pointer"
              >
                {" "}
                Click here
              </span>
            </p>
          ) : (
            <p>
              Back to login?
              <span
                onClick={() => setCurrState("Login")}
                className="text-violet-500 cursor-pointer"
              >
                {" "}
                Click here
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
