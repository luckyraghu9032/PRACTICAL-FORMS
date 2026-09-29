
                            function updateCourse() {
                                const cName = document.getElementById('assign-course-name').value;
                                const yr = document.getElementById('assign-year').value;
                                const sm = document.getElementById('assign-sem').value;
                                let val = cName;
                                if(yr) val += (val ? " - " : "") + "Yr " + yr;
                                if(sm) val += (val ? " - " : "") + "Sem " + sm;
                                document.getElementById('assign-course').value = val;
                            }
                        