import Account from "../../Account/Account";

// Profile.jsx used to import a UserProfile component that never existed in
// the repo (dead, broken code — see mock/README.md history). /profile and
// /account render the same Account feature; Sidebar.jsx already used this
// same component for its own "profile" entry point before this fix.
const Profile = () => {
  return <Account />;
};

export default Profile;
