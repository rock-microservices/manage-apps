import { makeStyles } from "@material-ui/core/styles";

import { red, green, amber, indigo } from "@material-ui/core/colors";

const useStyles = makeStyles({
  root: {
    minWidth: 275,
    marginTop: 40,
  },
  cardTitle: {
    display: "flex",
    alignItems: "center",
    marginBottom: 5,
    marginTop: 5,
  },
  badge: {
    backgroundColor: "#eee",
  },
  cardActionsLeft: {
    flexGrow: 1,
    paddingLeft: 8,
    "& > button": {
      marginRight: 10,
    },
  },
  terminalBtn: {
    color: "#333",
  },
  terminalBtnActive: {
    color: indigo[500],
  },
});

export { useStyles };
