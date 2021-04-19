import { makeStyles } from "@material-ui/core/styles";

import { red, green, amber, indigo } from "@material-ui/core/colors";

const useStyles = makeStyles({
  gitlabInfo: {
    display: "flex",
    alignItems: "center",
    fontSize: 12,
  },
  gitlabChip: {
    borderRadius: 4,
    marginLeft: 8,
    marginRight: 8,
    color: green[500],
    borderColor: green[500],
  },
  gitlabChipFailed: {
    color: red[500],
    borderColor: red[500],
  },
  gitlabChipRunning: {
    color: amber[500],
    borderColor: amber[500],
  },
  link: {
    cursor: "pointer",
  },
});

export { useStyles };
