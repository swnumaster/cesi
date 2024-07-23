import React, { Component } from "react";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";

import "./App.css";
import api from "services/api";
import {
  LoginPage,
  DashboardPage,
  ErrorPage,
  NodesPage,
  // GroupsPage,
  // EnvironmentsPage,
  UsersPage,
  AboutPage,
  ChangePasswordPage
} from "scenes/index";

import Header from "common/views/Header";

class App extends Component {
  state = {
    profile: null,
    version: "0",
    logs: [],
    nodes: [],
    environments: [],
    users: [],
    groups: [],
    checks: [],
    loadings: [],
  };

  handleRefreshActivityLogs = async () => {
    const logs = await api.activitylogs.get();
    this.setState({ logs });
  };

  handleClearActivityLogs = async () => {
    await api.activitylogs.clear();
    this.setState({ logs: [] });
  };

  handleRefreshGroups = async () => {
    const groups = await api.groups.get();
    this.setState({ groups });
  };

  handleRefreshNodes = async () => {
    const nodes = await api.nodes.get();
    const checks = nodes.map(node => node.general.name);
    this.setState({ nodes, checks });
  };

  handleRefreshNode = async (nodeName) => {
    // Show loading spinner
    this.setState(prevState => {
      const loadings = prevState.loadings.concat([nodeName]);
      return { loadings };
    });
    // Query node details
    const { node } = await api.nodes.getNode(nodeName);
    this.setState(prevState => {
      const nodes = prevState.nodes.map(n => {
        if (n.general.name === node.general.name) {
          return node;
        }
        return n;
      });
      return { nodes };
    });
    // Hide loading spinner
    this.setState(prevState => {
      const loadings = prevState.loadings.filter(name => name !== nodeName);
      return { loadings };
    });
  };

  handleCheckNode = async (nodeName) => {
    this.setState(prevState => ({
      checks: prevState.checks.concat([nodeName])
    }));
  };

  handleUncheckNode = async (nodeName) => {
    this.setState(prevState => ({
      checks: prevState.checks.filter(name => name !== nodeName)
    }));
  };

  handleRefreshEnvironments = async () => {
    const environments = await api.environments.get();
    this.setState({ environments });
  };

  handleRefreshDashboardSummary = async () => {
    await this.handleRefreshEnvironments();
    await this.handleRefreshNodes();
  };

  handleRefreshUsers = async () => {
    const users = await api.users.get();
    this.setState({ users });
  };

  handleRemoveUser = username => {
    api.users
      .remove(username)
      .then(() => this.handleRefreshUsers())
      .catch(error => console.log(error));
  };

  handleRefreshProfile = async () => {
    const profile = await api.profile.get();
    this.setState({ profile });
  };

  handleLogIn = (username, password) => {
    return new Promise(async (resolve, reject) => {
      try {
        await api.auth.logIn(username, password);
        resolve("okey");
        this.handleRefreshProfile();
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  };

  handleLogOut = () => {
    api.auth
      .logOut()
      .then(() => {
        this.handleRefreshProfile();
      })
      .catch(error => console.log(error));
  };

  getApiVersion = async () => {
    const version = await api.version.get();
    this.setState({ version });
  };

  componentDidMount() {
    this.handleRefreshProfile();
    this.getApiVersion();
  }
  render() {
    return (
      <React.Fragment>
        {this.state.profile ? (
          <HashRouter>
            <React.Fragment>
              <Header
                isAdmin={this.state.profile.type === 0}
                onLogOut={this.handleLogOut}
                version={this.state.version}
              />
              <Switch>
                <Redirect exact from="/" to="/dashboard" />
                <Route
                  path="/dashboard"
                  exact
                  render={props => (
                    <DashboardPage
                      {...props}
                      logs={this.state.logs}
                      environments={this.state.environments}
                      nodes={this.state.nodes}
                      clearActivityLogs={this.handleClearActivityLogs}
                      refreshActivityLogs={this.handleRefreshActivityLogs}
                      refreshDashboardSummary={
                        this.handleRefreshDashboardSummary
                      }
                    />
                  )}
                />
                <Route
                  path="/nodes"
                  exact
                  render={props => (
                    <NodesPage
                      {...props}
                      nodes={this.state.nodes}
                      checks={this.state.checks}
                      loadings={this.state.loadings}
                      refreshNode={this.handleRefreshNode}
                      refreshNodes={this.handleRefreshNodes}
                      handleCheckNode={this.handleCheckNode}
                      handleUncheckNode={this.handleUncheckNode}
                    />
                  )}
                />
                {/* <Route
                  path="/environments"
                  exact
                  render={props => (
                    <EnvironmentsPage
                      {...props}
                      environments={this.state.environments}
                      refreshEnvironments={this.handleRefreshEnvironments}
                    />
                  )}
                />
                <Route
                  path="/groups"
                  exact
                  render={props => (
                    <GroupsPage
                      {...props}
                      groups={this.state.groups}
                      refreshGroups={this.handleRefreshGroups}
                      nodes={this.state.nodes}
                      refreshNodes={this.handleRefreshNodes}
                    />
                  )}
                /> */}
                <Route
                  path="/users"
                  exact
                  render={props => (
                    <UsersPage
                      {...props}
                      users={this.state.users}
                      refreshUsers={this.handleRefreshUsers}
                      removeUser={this.handleRemoveUser}
                    />
                  )}
                />
                <Route path="/about" exact component={AboutPage} />
                <Route
                  path="/profile/change_password"
                  exact
                  component={ChangePasswordPage}
                />
                <Route component={ErrorPage} />
              </Switch>
            </React.Fragment>
          </HashRouter>
        ) : (
          <LoginPage onLogIn={this.handleLogIn} />
        )}
      </React.Fragment>
    );
  }
}

export default App;
