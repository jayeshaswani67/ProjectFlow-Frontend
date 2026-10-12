export type SidebarState = {
  collapsed: boolean;
  mobileOpen: boolean;
};

export type SidebarAction =
  | { type: "TOGGLE_COLLAPSED" }
  | { type: "OPEN_MOBILE" }
  | { type: "CLOSE_MOBILE" }
  | { type: "TOGGLE_MOBILE" };

export const initialSidebarState: SidebarState = {
  collapsed: false,
  mobileOpen: false,
};

export function sidebarReducer(
  state: SidebarState,
  action: SidebarAction,
): SidebarState {
  switch (action.type) {
    case "TOGGLE_COLLAPSED":
      return {
        ...state,
        collapsed: !state.collapsed,
      };

    case "OPEN_MOBILE":
      return {
        ...state,
        mobileOpen: true,
      };

    case "CLOSE_MOBILE":
      return {
        ...state,
        mobileOpen: false,
      };

    case "TOGGLE_MOBILE":
      return {
        ...state,
        mobileOpen: !state.mobileOpen,
      };

    default:
      return state;
  }
}