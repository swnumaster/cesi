import React, { Component } from "react";
import { Row, Col, Container } from "reactstrap";

import Processes from "common/helpers/Processes";
import FilterOfNodes from "scenes/nodes/components/FilterOfNodes";

class NodesPage extends Component {
  handleInputChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    if (value) {
      this.props.handleCheckNode(name);
    } else {
      this.props.handleUncheckNode(name);
    }
  };

  componentDidMount() {
    this.props.refreshNodes();
  }

  render() {
    const { nodes, refreshNodes, refreshNode } = this.props;

    return (
      <Container fluid>
        <Row>
          <Col sm={{ size: "auto" }}>
            <FilterOfNodes
              nodes={this.props.nodes}
              checks={this.props.checks}
              onInputChange={this.handleInputChange}
            />
          </Col>
          <Col>
            {nodes
              .filter(node => this.props.checks.indexOf(node.general.name) >= 0)
              .map(node => (
                <Processes
                  key={node.general.name}
                  node={node}
                  isLoading={this.props.loadings.indexOf(node.general.name) >= 0}
                  refreshNodes={refreshNodes}
                  refreshNode={refreshNode}
                />
              ))}
          </Col>
        </Row>
      </Container>
    );
  }
}

export default NodesPage;
