import React from 'react';

import { ComponentTree } from '../../../../model/component';
import Panel from '../../../../components/panel/Panel';
import ComponentDetails from '../componentDetails/ComponentDetails';

interface Props {
  selectedComponentId: string | null;
  tree: ComponentTree;
  onAddComponent: (parentId: string) => void;
  onDeleteComponent: (componentId: string) => void;
}

const SideBar: React.FC<Props> = ({ selectedComponentId, tree, onAddComponent, onDeleteComponent }) => {
  const component = selectedComponentId && tree.components[selectedComponentId];
  return (
    <div className="d-flex flex-column flex-fill">
      {selectedComponentId && component && (
        <ComponentDetails
          key={selectedComponentId}
          component={component}
          onAddComponent={onAddComponent}
          onDeleteComponent={onDeleteComponent}
        />
      )}
      {selectedComponentId && (
        <Panel continuous>
          <div className="card-header">Prop</div>
          <div className="card-body">Selected prop/hook</div>
        </Panel>
      )}
    </div>
  );
};

export default SideBar;
