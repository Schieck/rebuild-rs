import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

/**
 * Higher-order component to enforce role-based authorization.
 * @param {React.Component} WrappedComponent - The component to wrap and protect.
 * @param {string[]} requiredRoles - An array of roles required to access the wrapped component.
 */
function withRole(WrappedComponent, requiredRoles = []) {
  return function RoleProtectedComponent(props) {
    const auth = getAuth();
    const db = getFirestore();
    const navigate = useNavigate();
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const checkRole = async () => {
        const user = auth.currentUser;
        if (user) {
          try {
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);
            const userData = userDoc.data();

            if (userDoc.exists() && requiredRoles.includes(userData.role)) {
              setAuthorized(true);
            } else {
              navigate("/"); // Redirect if not authorized
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
            navigate("/"); // Redirect if data fetch fails
          }
        } else {
          navigate("/"); // Redirect if not logged in
        }
        setLoading(false); // Ensure loading is stopped after checking
      };

      checkRole();
    }, [auth, db, navigate]);

    if (loading) {
      return <p>Verificando permissões...</p>; // Loading indicator while checking permissions
    }

    if (!authorized) {
      return null; // Prevent unauthorized content from showing
    }

    return <WrappedComponent {...props} />;
  };
}

export default withRole;
