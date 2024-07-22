import React from "react";
import {
  Card,
  CardTitle,
  Badge,
  Button,
  Table,
  Modal,
  ModalHeader,
  ModalBody
} from "reactstrap";
import PropTypes from "prop-types";

import api from "services/api";

class ProcessLog extends React.Component {
  state = {
    modal: false,
    logs: null
  };

  toggle = () => {
    this.setState({
      modal: !this.state.modal
    });
  };

  showLogs = () => {
    const { node, process } = this.props;
    const processUniqueName = `${process.group}:${process.name}`;
    api.processes.process
      .log(node.general.name, processUniqueName)
      .then(data => {
        console.log(data);
        this.setState({
          logs: data.logs
        });
        this.toggle();
      });
  };

  render() {
    const { node, process } = this.props;
    return (
      <React.Fragment>
        <Button color="info" onClick={this.showLogs}>
          Log
        </Button>{" "}
        <Modal isOpen={this.state.modal} toggle={this.toggle} size="lg">
          <ModalHeader toggle={this.toggle}>
            Node: {node.general.name} | Process: {process.name}
          </ModalHeader>
          <ModalBody>
            {this.state.logs && (
              <React.Fragment>
                <strong>Stdout</strong>
                {this.state.logs.stdout.map(log => (
                  <p key={log}>{log}</p>
                ))}
                <br />
                <strong>Stderr</strong>
                {this.state.logs.stderr.map(log => (
                  <p key={log}>{log}</p>
                ))}
              </React.Fragment>
            )}
          </ModalBody>
        </Modal>
      </React.Fragment>
    );
  }
}

const Process = ({ node, process, refresh }) => {
  const handleProcess = action => {
    const nodeName = node.general.name;
    const processUniqueName = `${process.group}:${process.name}`;
    api.processes.process[action](nodeName, processUniqueName).then(data => {
      console.log(data);
      refresh();
    });
  };

  let rowClass = '';

  switch (process.statename) {
    case 'STARTING':
      rowClass = 'table-info';
      break;
    case 'RUNNING':
      rowClass = 'table-success';
      break;
    case 'STOPPED':
      rowClass = 'table-warning';
      break;
    case 'FATAL':
      rowClass = 'table-danger';
      break;
    default:
      rowClass = '';
  }

  return (
    <React.Fragment>
      <tr key={process.name} class={rowClass}>
        <td>{process.name}</td>
        <td>{process.group}</td>
        <td>{process.pid}</td>
        <td>{process.uptime}</td>
        <td>{process.statename}</td>
        <td>
          <Button color="success" onClick={() => handleProcess("start")}>
            Start
          </Button>{" "}
          <Button color="danger" onClick={() => handleProcess("stop")}>
            Stop
          </Button>{" "}
          <Button color="warning" onClick={() => handleProcess("restart")}>
            Restart
          </Button>{" "}
          <ProcessLog process={process} node={node} />
        </td>
      </tr>
    </React.Fragment>
  );
};

class Processes extends React.Component {
  static propTypes = {
    node: PropTypes.object.isRequired,
    filterFunc: PropTypes.func
  };
  static defaultProps = {
    filterFunc: () => true
  };

  handleAllProcess = action => {
    const nodeName = this.props.node.general.name;
    api.nodes.allProcesses[action](nodeName).then(() => {
      console.log("Updating nodes for single node action.");
      this.props.refreshNodes();
    });
  };

  refreshNode = () => {
    this.props.refreshNode(this.props.node.general.name);
  }

  componentDidMount() {
    this.refreshNode();
  }

  render() {
    const { node, filterFunc } = this.props;
    return (
      <React.Fragment>
        <Card body>
          <CardTitle>
            Processes for {node.general.name}{" "}
            <Badge color="secondary">{node.processes.length}</Badge>{" "}
            <Button
              color="primary"
              onClick={() => this.refreshNode()}
            >
              Refresh
            </Button>{" "}
            <Button
              color="success"
              onClick={() => this.handleAllProcess("start")}
            >
              Start All
            </Button>{" "}
            <Button
              color="danger"
              onClick={() => this.handleAllProcess("stop")}
            >
              Stop All
            </Button>{" "}
            <Button
              color="warning"
              onClick={() => this.handleAllProcess("restart")}
            >
              Restart All
            </Button>{" "}
          </CardTitle>
          {node.processes.length !== 0 ? (
            <Table hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Group</th>
                  <th>Pid</th>
                  <th>Uptime</th>
                  <th>State</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {node.processes.filter(filterFunc).map(process => (
                  <Process
                    key={`${node.name}:${process.name}`}
                    node={node}
                    process={process}
                    refresh={this.props.refresh}
                  />
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No processes configured.</p>
          )}
        </Card>
        <br />
      </React.Fragment>
    );
  }
}

export default Processes;
