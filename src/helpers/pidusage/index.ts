import stats from "./stats";

export interface Stat {
  /**
   * percentage (from 0 to 100*vcore)
   */
  cpu: number;

  /**
   * bytes
   */
  memory: number;

  /**
   * PPID
   */
  ppid: number;

  /**
   * PID
   */
  pid: number;

  /**
   * ms user + system time
   */
  ctime: number;

  /**
   * ms since the start of the process
   */
  elapsed: number;

  /**
   * ms since epoch
   */
  timestamp: number;
}

function pidusage(pids: number | number[], options?: { [key: string]: any }) {
  return new Promise(function (resolve, reject) {
    stats(pids, options || {}, function (err, data) {
      if (err) return reject(err);
      resolve(data as Stat);
    });
  });
}

export default pidusage;
