import React from "react";
import { connect } from "react-redux";
import ContentTypeListItem from "./ContentTypeListItem";
import selectContentTypes from "../../selectors/contentTypes";

export const ContentTypesList = props => (
  <div>
    <div className="list-header">
      <div className="show-for-mobile">Content Types</div>
      <div className="show-for-desktop">Title</div>
      {/* <div className="show-for-desktop">Slug</div> */}
    </div>
    <div className="list-body">
      {props.contentTypes.length === 0 ? (
        <div className="list-item list-item--message">
          <span>No content types</span>
        </div>
      ) : (
        props.contentTypes.map(contentType => {
          return <ContentTypeListItem {...contentType} key={contentType.id} />;
        })
      )}
    </div>
  </div>
);

const mapStateToProps = state => {
  return {
    contentTypes: selectContentTypes(state.contentTypes, { sortBy: "title" })
  };
};

export default connect(mapStateToProps)(ContentTypesList);
