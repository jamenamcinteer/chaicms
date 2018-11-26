import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { startLogin } from "../actions/auth";
import { startAddUser } from "../actions/users";
import { startSetUserRoleId } from "../actions/userRoles";
import { startEditInviteCode } from "../actions/inviteCodes";

export const RegistrationPage = ({
  startLogin,
  startAddUser,
  startEditInviteCode,
  startSetUserRoleId,
  settings,
  users,
  userRoles,
  auth,
  inviteCodes,
  history
}) => {
  const [registrationCheck, setRegistrationCheck] = useState(false);
  const [needInviteCodeEntry, setNeedInviteCodeEntry] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    setRegistrationCheck(true);
    if (!registrationCheck) {
      // this is to keep this code from running every time useEffect runs
      // Check if user is registered (exists in users object in db)
      const userExists = users.find(user => {
        return user.uid === auth.uid;
      });
      if (userExists) {
        history.push("/dashboard");
      } else {
        // Check if invite codes are required
        const requireInviteCodes = settings.requireInviteCodes;
        // If invite codes are not required, register the user and log them in
        if (!requireInviteCodes) {
          // startSetUserRoleId("member").then(() => {
          console.log(userRoles);
          const newUser = {
            uid: auth.uid,
            displayName: auth.displayName,
            email: auth.email,
            photoURL: auth.photoURL,
            role: "member",
            // roleId: userRoles.id ? userRoles.id : "?",
            isApproved: false
          };
          // console.log(newUser);
          startAddUser(newUser).then(() => {
            // console.log(userRoles); //need to unset
            history.push("/dashboard");
          });
          // });
        } else {
          setNeedInviteCodeEntry(true);
          // If invite codes are required, check if the user has one (should come in through url, saved in sessionStorage, or can be entered by user on this screen)
          // If the user has an invite code and it is valid, register the user and log them in
        }
      }
    }
  });
  const onSubmit = e => {
    e.preventDefault();

    // check if invite code is valid
    const inviteCodeExists = inviteCodes.find(code => {
      return code.code === inviteCode && code.status === "enabled";
    });

    if (!inviteCode || !inviteCodeExists) {
      const error = "Please provide a valid invite code";
      setError(error);
    } else {
      const error = "";
      setError(error);
      // register user
      // expire invite code
      const updateInviteCode = {
        status: "expired"
      };
      const newUser = {
        uid: auth.uid,
        displayName: auth.displayName,
        email: auth.email,
        photoURL: auth.photoURL,
        role: "member",
        isApproved: true
      };
      startAddUser(newUser).then(() => {
        startEditInviteCode(inviteCodeExists.id, updateInviteCode).then(() => {
          history.push("/dashboard");
        });
      });
    }
  };
  return (
    <div>
      {/* <Redirect to="/dashboard" /> */}
      {needInviteCodeEntry && (
        <div className="box-layout">
          <div className="box-layout__box">
            <h1 className="box-layout__title">Registration</h1>
            <p>An invite code is required to register.</p>
            <form className="form" onSubmit={onSubmit}>
              {error && <p className="form__error">{error}</p>}
              <input
                className="text-input"
                type="text"
                placeholder="Enter invite code"
                autoFocus
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value)}
              />
              <div>
                <button className="button">Continue</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state, props) => {
  return {
    settings: state.settings,
    users: state.users,
    userRoles: state.userRoles,
    auth: state.auth,
    inviteCodes: state.inviteCodes
  };
};

const mapDispatchToProps = dispatch => ({
  startLogin: () => dispatch(startLogin()),
  startAddUser: user => dispatch(startAddUser(user)),
  startEditInviteCode: (id, updates) =>
    dispatch(startEditInviteCode(id, updates)),
  startSetUserRoleId: role => dispatch(startSetUserRoleId(role))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RegistrationPage);