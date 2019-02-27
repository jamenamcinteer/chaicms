import React from "react";
import { connect } from "react-redux";
import ContentTypeForm from "./ContentTypeForm";
import {
  startEditContentType,
  startRemoveContentType
} from "../../actions/contentTypes";
import selectFields from "../../selectors/fields";

export class EditContentTypePage extends React.Component {
  onSubmit = contentType => {
    this.props.startEditContentType(this.props.contentType.id, contentType);
    this.props.history.push("/content-types");
  };
  onRemove = () => {
    this.props.startRemoveContentType({ id: this.props.contentType.id });
    this.props.history.push("/content-types");
  };
  render() {
    return (
      <div>
        <div className="page-header">
          <div className="content-container">
            <h1 className="page-header__title">Edit Content Type</h1>
          </div>
        </div>
        <div className="content-container">
          <ContentTypeForm
            contentType={this.props.contentType}
            contentTypes={this.props.contentTypes}
            fields={this.props.fields}
            currentUser={this.props.currentUser}
            onSubmit={this.onSubmit}
            onRemove={this.onRemove}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    contentType: state.contentTypes.find(
      contentType => contentType.id === props.match.params.id
    ),
    contentTypes: state.contentTypes,
    fields: selectFields(state.fields),
    currentUser: state.auth
  };
};

const mapDispatchToProps = (dispatch, props) => ({
  startEditContentType: (id, contentType) =>
    dispatch(startEditContentType(id, contentType)),
  startRemoveContentType: data => dispatch(startRemoveContentType(data))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditContentTypePage);
