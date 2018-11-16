import React from "react";
import { connect } from "react-redux";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import SettingsForm from "./SettingsForm";
import InviteCodesForm from "./InviteCodesForm";
import { startEditSettings } from "../actions/settings";
import {
  startAddInviteCode,
  startEditInviteCode
} from "../actions/inviteCodes";

export class SettingsPage extends React.Component {
  onSubmit = settings => {
    this.props.startEditSettings(settings);
  };
  onGenerateInviteCode = () => {
    this.props.startAddInviteCode();
  };
  onEditInviteCode = code => {
    this.props.startEditInviteCode(code.id, code);
  };
  render() {
    return (
      <div>
        <div className="page-header">
          <div className="content-container">
            <h1 className="page-header__title">Settings</h1>
          </div>
        </div>
        <div className="content-container content-container--centered">
          <Tabs>
            <TabList>
              <Tab>General Settings</Tab>
              {this.props.settings.requireInviteCodes && (
                <Tab>Invite Codes</Tab>
              )}
            </TabList>

            <TabPanel>
              <SettingsForm
                settings={this.props.settings}
                onSubmit={this.onSubmit}
              />
            </TabPanel>
            {this.props.settings.requireInviteCodes && (
              <TabPanel>
                <InviteCodesForm
                  inviteCodes={this.props.inviteCodes}
                  onGenerateInviteCode={this.onGenerateInviteCode}
                  onEditInviteCode={this.onEditInviteCode}
                />
              </TabPanel>
            )}
          </Tabs>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    settings: state.settings,
    inviteCodes: state.inviteCodes
  };
};

const mapDispatchToProps = dispatch => ({
  startEditSettings: settings => dispatch(startEditSettings(settings)),
  startAddInviteCode: () => dispatch(startAddInviteCode()),
  startEditInviteCode: (id, code) => dispatch(startEditInviteCode(id, code))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingsPage);
