import { useState } from 'react';
import omit from 'ramda/es/omit';
import remove from 'ramda/es/remove';
import update from 'ramda/es/update';
import without from 'ramda/es/without';

import { ComponentTree, Component, ComponentProperty } from '../../../model/component';
import { uniqueId } from '../../../utils/strings';

interface State {
  tree: ComponentTree;
}

const initialState: State = {
  tree: {
    components: {
      root: { id: 'root', parentId: null, name: 'App', width: 12, properties: [], hooks: [] },
      diagram: { id: 'diagram', parentId: 'root', name: 'Diagram', width: 12, properties: [], hooks: [] }
    },
    byParent: {
      root: ['diagram'],
      diagram: []
    }
  }
};

const handleAddComponent = (parentId: string, id: string) => (state: State): State => ({
  ...state,
  tree: {
    ...state.tree,
    components: {
      ...state.tree.components,
      [id]: { id, parentId, name: 'Component', width: 12, properties: [], hooks: [] }
    },
    byParent: {
      ...state.tree.byParent,
      [id]: [],
      [parentId]: [...state.tree.byParent[parentId], id]
    }
  }
});

const handleDeleteComponent = (componentId: string) => (state: State): State => {
  const parentId = state.tree.components[componentId].parentId!;

  const componentIdsToRemove: string[] = [];
  const collectComponentsToRemove = (id: string) => {
    componentIdsToRemove.push(id);
    state.tree.byParent[id].forEach(collectComponentsToRemove);
  };

  collectComponentsToRemove(componentId);

  return {
    ...state,
    tree: {
      ...state.tree,
      components: omit(componentIdsToRemove, state.tree.components),
      byParent: {
        ...omit(componentIdsToRemove, state.tree.byParent),
        [parentId]: without([componentId], state.tree.byParent[parentId])
      }
    }
  };
};

const handleAddProp = (componentId: string) => (state: State): State => ({
  ...state,
  tree: {
    ...state.tree,
    components: {
      ...state.tree.components,
      [componentId]: {
        ...state.tree.components[componentId],
        properties: [...state.tree.components[componentId].properties, { name: 'prop', type: 'string' }]
      }
    }
  }
});

const handleAddHook = (componentId: string) => (state: State): State => ({
  ...state,
  tree: {
    ...state.tree,
    components: {
      ...state.tree.components,
      [componentId]: {
        ...state.tree.components[componentId],
        hooks: [...state.tree.components[componentId].hooks, { name: 'useHook' }]
      }
    }
  }
});

const handleUpdateComponent = (componentId: string, data: Partial<Component>) => (state: State): State => ({
  ...state,
  tree: {
    ...state.tree,
    components: {
      ...state.tree.components,
      [componentId]: { ...state.tree.components[componentId], ...data }
    }
  }
});

const handleUpdateProp = (componentId: string, propIndex: number, data: Partial<ComponentProperty>) => (
  state: State
): State => ({
  ...state,
  tree: {
    ...state.tree,
    components: {
      ...state.tree.components,
      [componentId]: {
        ...state.tree.components[componentId],
        properties: update(
          propIndex,
          { ...state.tree.components[componentId].properties[propIndex], ...data },
          state.tree.components[componentId].properties
        )
      }
    }
  }
});

const handleDeleteProp = (componentId: string, propIndex: number) => (state: State): State => ({
  ...state,
  tree: {
    ...state.tree,
    components: {
      ...state.tree.components,
      [componentId]: {
        ...state.tree.components[componentId],
        properties: remove(propIndex, 1, state.tree.components[componentId].properties)
      }
    }
  }
});

export const useComponentModel = () => {
  const [state, setState] = useState(initialState);

  const addComponent = (parentId: string) => {
    const componentId = uniqueId();
    setState(handleAddComponent(parentId, componentId));

    return componentId;
  };

  const deleteComponent = (id: string) => setState(handleDeleteComponent(id));

  const updateComponent = (id: string, data: Partial<Component>) => setState(handleUpdateComponent(id, data));

  const addProp = (componentId: string) => {
    setState(handleAddProp(componentId));
    return state.tree.components[componentId].properties.length;
  };

  const updateProp = (componentId: string, propIndex: number, data: Partial<ComponentProperty>) =>
    setState(handleUpdateProp(componentId, propIndex, data));

  const deleteProp = (componentId: string, propIndex: number) =>
    setState(handleDeleteProp(componentId, propIndex));

  const addHook = (componentId: string) => {
    setState(handleAddHook(componentId));
    return state.tree.components[componentId].hooks.length;
  };

  return {
    ...state,
    addComponent,
    deleteComponent,
    updateComponent,
    addProp,
    updateProp,
    deleteProp,
    addHook
  };
};
