import { useState, useEffect, useRef } from "react";
import { httpsCallable } from "firebase/functions";
import { signInWithCustomToken } from "firebase/auth";
import { auth, functions } from "./firebase";

function App() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [functionName, setFunctionName] = useState("");
  const [users, setUsers] = useState(10);
  const [token, setToken] = useState("");

  const [roleType, setRoleType] = useState("");
  const [parentKey, setParentKey] = useState("");
  const [sessionUUID, setSessionUUID] = useState("");

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const logRef = useRef(null);

  // 🔥 Auto scroll
  useEffect(() => {
    logRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // 🔥 Restore session
  useEffect(() => {
    const idToken = localStorage.getItem("idToken");
    const savedRoleType = localStorage.getItem("roleType");
    const savedParentKey = localStorage.getItem("parentKey");
    const savedSessionUUID = localStorage.getItem("sessionUUID");

    if (idToken) {
      setToken(idToken);
      setRoleType(savedRoleType);
      setParentKey(savedParentKey);
      setSessionUUID(savedSessionUUID);

      addLog("Auto login successful", "success");
      addLog(`parentKey: ${savedParentKey}`);
      addLog(`roleType: ${savedRoleType}`);
      addLog(`sessionUUID: ${savedSessionUUID}`);
    }
  }, []);

  const addLog = (message, type = "info") => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, time }]);
  };

  // 🔐 LOGIN
  const login = async () => {
    try {
      addLog("Logging in...");

      const loginFn = httpsCallable(functions, "adminLogin");

      const res = await loginFn({
        isOtpVerified: true,
        identifier: "GYANAJMERA1234512345U",
        password: "12341234",
        data: {}
      });

      if (res.data.code !== 100) {
        addLog("Login failed: " + res.data.message, "error");
        return;
      }

      const loginData = res.data.data;

      const customToken = loginData.token;
      const roleType = loginData.roleType;
      const parentKey = loginData.parentKey;
      const sessionUUID = loginData.sessionUUID;

      const userCred = await signInWithCustomToken(auth, customToken);
      const idToken = await userCred.user.getIdToken();

      setToken(idToken);
      setRoleType(roleType);
      setParentKey(parentKey);
      setSessionUUID(sessionUUID);

      // 🔥 Save all
      localStorage.setItem("idToken", idToken);
      localStorage.setItem("roleType", roleType);
      localStorage.setItem("parentKey", parentKey);
      localStorage.setItem("sessionUUID", sessionUUID);

      addLog("Login successful", "success");

    } catch (err) {
      addLog("Login error: " + err.message, "error");
    }
  };

  // 🔥 Build payload dynamically
  const buildPayload = () => ({
    meterSerial: "100058",
    cRechargeTokenId: "01",
    cRechargeAmount: "100",
    cIsFromPending: false,
    cOldRequestTime: Date.now().toString(),
    cPaymentMode: "ONLINE",
    cPaymentDetail: "UPI",
    cTotalDeduction: "10",
    cNumberOfDays: "30",
    cFixedChargeRate: "5",
    cTariffRate: "2",
    cImageUrl: "",
    checkFlag72: false,

    // 🔥 dynamic values
    roleType,
    parentKey,
    sessionUUID
  });

  // 🚀 LOAD TEST
  const startTest = async () => {
    if (!token) {
      addLog("Please login first", "error");
      return;
    }

    try {
      setLoading(true);
      addLog(`🚀 Starting load test (${users} users)...`);

      const payload = buildPayload();

      const res = await fetch("http://localhost:3000/run-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          functionName,
          users,
          token,
          payload
        })
      });

      const data = await res.json();

      addLog("✅ Test completed", "success");
      addLog(data.output || data.error);

    } catch (err) {
      addLog("❌ Error: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // 🔍 DIRECT FIREBASE CALL
  const testDirectFirebaseCall = async () => {
    try {
      addLog("🔍 Calling Firebase function directly...");

      const fn = httpsCallable(functions, functionName);
      const payload = buildPayload();

      const res = await fn(payload);

      addLog("✅ Direct call success", "success");
      addLog(JSON.stringify(res.data, null, 2));

    } catch (err) {
      addLog("❌ Direct call failed: " + err.message, "error");
    }
  };

  const logout = () => {
    localStorage.clear();
    setToken("");
    setRoleType("");
    setParentKey("");
    setSessionUUID("");
    addLog("Logged out");
  };

  return (
      <div style={styles.container}>

        <div style={styles.topPanel}>

          {/* LOGIN */}
          <div style={styles.card}>
            <h3>🔐 Login</h3>

            <input
                placeholder="Login ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
            />

            <button onClick={login} disabled={!!token} style={{ ...styles.button, background: "#2563eb" }}>
              {token ? "Logged In" : "Login"}
            </button>

            {token && (
                <button onClick={logout} style={{ ...styles.button, background: "#ef4444" }}>
                  Logout
                </button>
            )}
          </div>

          {/* CONFIG */}
          <div style={styles.card}>
            <h3>⚙️ Test Config</h3>

            <input
                placeholder="Function Name"
                value={functionName}
                onChange={(e) => setFunctionName(e.target.value)}
                style={styles.input}
            />

            <input
                type="number"
                value={users}
                onChange={(e) => setUsers(e.target.value)}
                style={styles.input}
            />

            <button onClick={startTest} disabled={loading} style={{ ...styles.button, background: "#22c55e" }}>
              {loading ? "Running..." : "🚀 Start Test"}
            </button>

            <button onClick={testDirectFirebaseCall} style={{ ...styles.button, background: "#f59e0b" }}>
              🔍 Test Firebase Direct
            </button>
          </div>

          {/* ACTIONS */}
          <div style={styles.card}>
            <h3>🧹 Actions</h3>
            <button onClick={() => setLogs([])} style={{ ...styles.button, background: "#444" }}>
              Clear Logs
            </button>
          </div>

        </div>

        {/* OUTPUT */}
        <div style={styles.outputContainer}>
          <div style={styles.outputHeader}>📊 Live Logs</div>
          <div style={styles.logArea}>
            {logs.map((log, i) => (
                <div key={i} style={getLogStyle(log.type)}>
                  [{log.time}] {log.message}
                </div>
            ))}
            <div ref={logRef}></div>
          </div>
        </div>

      </div>
  );


}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    background: "#0f172a",
    color: "#fff"
  },

  topPanel: {
    display: "flex",
    gap: "20px",
    padding: "20px",
    borderBottom: "1px solid #333"
  },

  card: {
    background: "#1e293b",
    padding: "15px",
    borderRadius: "8px",
    width: "250px"
  },

  input: {
    width: "100%",
    marginBottom: "10px",
    padding: "8px",
    background: "#0f172a",
    color: "#fff",
    border: "1px solid #444"
  },

  button: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    border: "none",
    cursor: "pointer",
    color: "#fff"
  },

  outputContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column"
  },

  outputHeader: {
    padding: "10px",
    borderBottom: "1px solid #333"
  },

  logArea: {
    flex: 1,
    overflow: "auto",
    padding: "10px",
    background: "#000",
    fontSize: "12px"
  }
};

const getLogStyle = (type) => {
  switch (type) {
    case "error":
      return { color: "#ef4444" };
    case "success":
      return { color: "#22c55e" };
    default:
      return { color: "#00ff9d" };
  }
};

export default App;